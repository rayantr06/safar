-- Safar DZ — RLS Completion & Race-Condition Protection
-- Enables RLS on the 3 remaining tables and adds an atomic
-- booking-creation function with advisory locking.

-- ==========================================
-- 1. ENABLE RLS ON REMAINING TABLES
-- ==========================================

-- experience_images: read-only for public, admin manages
ALTER TABLE experience_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads experience images" ON experience_images;
CREATE POLICY "Public reads experience images" ON experience_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manages experience images" ON experience_images;
CREATE POLICY "Admin manages experience images" ON experience_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- booking_status_history: admin manages, provider reads for own bookings
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access booking history" ON booking_status_history;
CREATE POLICY "Admin full access booking history" ON booking_status_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Provider reads own booking history" ON booking_status_history;
CREATE POLICY "Provider reads own booking history" ON booking_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_status_history.booking_id
        AND b.provider_id = auth.uid()
    )
  );

-- provider_payouts: admin manages, provider reads own
ALTER TABLE provider_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access payouts" ON provider_payouts;
CREATE POLICY "Admin full access payouts" ON provider_payouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Provider reads own payouts" ON provider_payouts;
CREATE POLICY "Provider reads own payouts" ON provider_payouts
  FOR SELECT USING (provider_id = auth.uid());

-- ==========================================
-- 2. ATOMIC BOOKING CREATION (prevents race conditions)
-- ==========================================
-- Uses pg_advisory_xact_lock with a hash of (boat_id, booking_date)
-- to serialize concurrent booking attempts for the same boat+date.
-- Two concurrent requests for different boats or dates proceed in parallel.

CREATE OR REPLACE FUNCTION public.atomic_create_booking(
  p_boat_id UUID,
  p_booking_date DATE,
  p_booking_time TIME,
  p_duration_minutes INTEGER,
  p_experience_id UUID,
  p_client_name TEXT,
  p_client_phone TEXT,
  p_client_notes TEXT DEFAULT '',
  p_guest_count INTEGER DEFAULT 1,
  p_booking_type TEXT DEFAULT 'private',
  p_total_amount BIGINT DEFAULT 0,
  p_commission_amount BIGINT DEFAULT 0,
  p_provider_amount BIGINT DEFAULT 0,
  p_commission_rate NUMERIC DEFAULT 15.00,
  p_provider_id UUID DEFAULT NULL,
  p_client_id UUID DEFAULT NULL,
  p_time_slot_id UUID DEFAULT NULL,
  p_booking_source TEXT DEFAULT 'SAFAR_DZ',
  p_created_by TEXT DEFAULT 'CUSTOMER'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lock_key INTEGER;
  conflict_exists BOOLEAN := FALSE;
  conflict_ref TEXT;
  conflict_time TIME;
  conflict_end TIME;
  new_ref TEXT;
  new_booking JSON;
  start_mins INTEGER;
  end_mins INTEGER;
  end_h INTEGER;
  end_m INTEGER;
  end_time_str TEXT;
  existing_booked_seats INTEGER;
  existing_total_seats INTEGER;
BEGIN
  -- Generate a lock key from boat_id + booking_date (stable across sessions)
  lock_key := hashtext(p_boat_id::text || p_booking_date::text);

  -- Acquire advisory lock for this boat+date combination
  PERFORM pg_advisory_xact_lock(lock_key);

  -- Check for overlapping bookings (same boat, same date, not cancelled)
  SELECT
    b.booking_ref,
    b.booking_time,
    (b.booking_time + (COALESCE(b.duration_minutes, 120) || ' minutes')::interval)::time
  INTO conflict_ref, conflict_time, conflict_end
  FROM bookings b
  WHERE b.boat_id = p_boat_id
    AND b.booking_date = p_booking_date
    AND b.status != 'cancelled'
    AND p_booking_time < (b.booking_time + (COALESCE(b.duration_minutes, 120) || ' minutes')::interval)::time
    AND b.booking_time < (p_booking_time + (p_duration_minutes || ' minutes')::interval)::time
  LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', format(
        'Ce créneau est déjà réservé par la réservation %s (%s - %s)',
        conflict_ref,
        conflict_time::text,
        conflict_end::text
      )
    );
  END IF;

  -- Generate booking ref
  new_ref := '#SF-' || floor(random() * 9000 + 1000)::int;

  -- Calculate end_time
  start_mins := EXTRACT(HOUR FROM p_booking_time) * 60 + EXTRACT(MINUTE FROM p_booking_time);
  end_mins := start_mins + p_duration_minutes;
  end_h := (end_mins / 60) % 24;
  end_m := end_mins % 60;
  end_time_str := lpad(end_h::text, 2, '0') || ':' || lpad(end_m::text, 2, '0');

  -- Insert the booking
  INSERT INTO bookings (
    booking_ref, experience_id, time_slot_id, provider_id, client_id,
    client_name, client_phone, client_notes, guest_count, booking_type,
    total_amount, commission_amount, provider_amount, commission_rate,
    status, booking_date, booking_time, booking_source, created_by,
    duration_minutes, start_time, end_time, boat_id
  ) VALUES (
    new_ref, p_experience_id, p_time_slot_id, p_provider_id, p_client_id,
    p_client_name, p_client_phone, p_client_notes, p_guest_count, p_booking_type,
    p_total_amount, p_commission_amount, p_provider_amount, p_commission_rate,
    'new', p_booking_date, p_booking_time, p_booking_source, p_created_by,
    p_duration_minutes, p_booking_time::text, end_time_str, p_boat_id
  )
  RETURNING to_json(bookings.*) INTO new_booking;

  -- Insert status history
  INSERT INTO booking_status_history (booking_id, new_status, note)
  VALUES ((new_booking->>'id')::uuid, 'new', 'Réservation initiale du client');

  -- Update time_slot booked_seats for shared bookings
  IF p_time_slot_id IS NOT NULL AND p_booking_type = 'shared' THEN
    SELECT booked_seats, total_seats
    INTO existing_booked_seats, existing_total_seats
    FROM time_slots
    WHERE id = p_time_slot_id
    FOR UPDATE;

    IF FOUND THEN
      IF existing_booked_seats + p_guest_count <= existing_total_seats THEN
        UPDATE time_slots
        SET booked_seats = existing_booked_seats + p_guest_count
        WHERE id = p_time_slot_id;
      ELSE
        -- Not enough seats — rollback booking by raising exception
        RAISE EXCEPTION 'Pas assez de places disponibles (% restantes)', existing_total_seats - existing_booked_seats;
      END IF;
    END IF;
  END IF;

  RETURN json_build_object(
    'success', true,
    'booking_ref', new_ref,
    'booking_id', (new_booking->>'id')::uuid
  );
END;
$$;

-- ==========================================
-- 3. ATOMIC PARTNER BOOKING CREATION
-- ==========================================
-- Same advisory locking but for partner-created bookings (0% commission).

CREATE OR REPLACE FUNCTION public.atomic_create_partner_booking(
  p_boat_id UUID,
  p_booking_date DATE,
  p_booking_time TIME,
  p_duration_minutes INTEGER,
  p_client_name TEXT,
  p_client_phone TEXT,
  p_client_notes TEXT DEFAULT '',
  p_guest_count INTEGER DEFAULT 1,
  p_total_amount BIGINT DEFAULT 0,
  p_provider_id UUID DEFAULT NULL,
  p_experience_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lock_key INTEGER;
  conflict_exists BOOLEAN := FALSE;
  conflict_ref TEXT;
  conflict_time TIME;
  conflict_end TIME;
  new_ref TEXT;
  new_booking JSON;
  start_mins INTEGER;
  end_mins INTEGER;
  end_h INTEGER;
  end_m INTEGER;
  end_time_str TEXT;
BEGIN
  lock_key := hashtext(p_boat_id::text || p_booking_date::text);
  PERFORM pg_advisory_xact_lock(lock_key);

  SELECT
    b.booking_ref,
    b.booking_time,
    (b.booking_time + (COALESCE(b.duration_minutes, 120) || ' minutes')::interval)::time
  INTO conflict_ref, conflict_time, conflict_end
  FROM bookings b
  WHERE b.boat_id = p_boat_id
    AND b.booking_date = p_booking_date
    AND b.status != 'cancelled'
    AND p_booking_time < (b.booking_time + (COALESCE(b.duration_minutes, 120) || ' minutes')::interval)::time
    AND b.booking_time < (p_booking_time + (p_duration_minutes || ' minutes')::interval)::time
  LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', format(
        'Ce créneau est déjà réservé par la réservation %s (%s - %s)',
        conflict_ref,
        conflict_time::text,
        conflict_end::text
      )
    );
  END IF;

  new_ref := '#PR-' || floor(random() * 9000 + 1000)::int;

  start_mins := EXTRACT(HOUR FROM p_booking_time) * 60 + EXTRACT(MINUTE FROM p_booking_time);
  end_mins := start_mins + p_duration_minutes;
  end_h := (end_mins / 60) % 24;
  end_m := end_mins % 60;
  end_time_str := lpad(end_h::text, 2, '0') || ':' || lpad(end_m::text, 2, '0');

  INSERT INTO bookings (
    booking_ref, experience_id, provider_id, client_name, client_phone,
    client_notes, guest_count, booking_type, total_amount, commission_amount,
    provider_amount, commission_rate, status, booking_date, booking_time,
    booking_source, created_by, duration_minutes, start_time, end_time, boat_id
  ) VALUES (
    new_ref, p_experience_id, p_provider_id, p_client_name, p_client_phone,
    p_client_notes, p_guest_count, 'private', p_total_amount, 0,
    p_total_amount, 0, 'confirmed', p_booking_date, p_booking_time,
    'PARTNER_DIRECT', 'PARTNER', p_duration_minutes, p_booking_time::text, end_time_str, p_boat_id
  )
  RETURNING to_json(bookings.*) INTO new_booking;

  RETURN json_build_object(
    'success', true,
    'booking_ref', new_ref,
    'booking_id', (new_booking->>'id')::uuid
  );
END;
$$;
