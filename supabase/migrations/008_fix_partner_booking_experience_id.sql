-- Safar DZ — Fix atomic_create_partner_booking experience_id
-- Migration 007 introduced this function with a hardcoded experience_id = '1'
-- in the INSERT, which is invalid (experience_id is a UUID column and '1' is
-- not a valid UUID). This migration replaces the function with the corrected
-- version that accepts p_experience_id as a parameter (DEFAULT NULL) and
-- passes it through to the bookings table.
--
-- Partner manual bookings are boat-based: the partner selects a boat and
-- enters price/duration manually. No experience catalog selection exists
-- in the partner form, so experience_id defaults to NULL.
--
-- The customer booking flow (atomic_create_booking) is unaffected — it
-- already correctly receives and persists the validated experience_id.
--
-- This migration is safe to apply to any environment:
-- - If migration 007 was applied with the old function, this replaces it.
-- - If migration 007 was already corrected, this is a no-op (CREATE OR REPLACE).
-- - The function signature is backward-compatible: existing callers that
--   don't pass p_experience_id will get NULL (the intended default).

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
  new_ref := '#PR-' || floor(random() * 9000 + 1000)::int;

  -- Calculate end_time
  start_mins := EXTRACT(HOUR FROM p_booking_time) * 60 + EXTRACT(MINUTE FROM p_booking_time);
  end_mins := start_mins + p_duration_minutes;
  end_h := (end_mins / 60) % 24;
  end_m := end_mins % 60;
  end_time_str := lpad(end_h::text, 2, '0') || ':' || lpad(end_m::text, 2, '0');

  -- Insert the booking
  -- experience_id: NULL by default (partner bookings are boat-based, not experience-based)
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
