-- Safar DZ — Initial Schema Migration
-- Run this against your Supabase project

-- 1. Profiles (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'provider')) DEFAULT 'provider',
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Providers (Extends Profiles)
CREATE TABLE providers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  port_location TEXT DEFAULT 'Port de Béjaïa',
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC(2,1) DEFAULT 0,
  total_trips INTEGER DEFAULT 0,
  total_revenue BIGINT DEFAULT 0,
  commission_rate NUMERIC(4,2) DEFAULT 15.00,
  commission_effective_date DATE DEFAULT now(),
  commission_status TEXT DEFAULT 'active' CHECK (commission_status IN ('active', 'inactive')),
  commission_last_modified TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Boats
CREATE TABLE boats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('private', 'shared', 'jetski', 'kayak', 'paddle', 'other')),
  capacity INTEGER NOT NULL,
  description TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Destinations
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 5. Experiences
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boat_id UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  destination_id UUID REFERENCES destinations(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('private', 'shared', 'jetski', 'kayak', 'paddle', 'other')),
  price_total BIGINT,
  price_per_seat BIGINT,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  max_guests INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Experience Images
CREATE TABLE experience_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  alt_text TEXT
);

-- 7. Time Slots
CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_seats INTEGER NOT NULL,
  booked_seats INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_slot UNIQUE (experience_id, date, start_time)
);

-- 8. Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref TEXT UNIQUE NOT NULL,
  experience_id UUID NOT NULL REFERENCES experiences(id),
  time_slot_id UUID REFERENCES time_slots(id),
  provider_id UUID REFERENCES providers(id),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_notes TEXT,
  guest_count INTEGER NOT NULL DEFAULT 1,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('private', 'shared')),
  total_amount BIGINT NOT NULL,
  commission_amount BIGINT NOT NULL,
  provider_amount BIGINT NOT NULL,
  commission_rate NUMERIC(4,2) DEFAULT 15.00,
  status TEXT NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'pending', 'confirmed', 'assigned', 'completed', 'cancelled')
  ),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  booking_source TEXT DEFAULT 'SAFAR_DZ' CHECK (booking_source IN ('SAFAR_DZ', 'PARTNER_DIRECT')),
  duration_minutes INTEGER DEFAULT 120,
  start_time TIME,
  end_time TIME,
  created_by TEXT DEFAULT 'CUSTOMER' CHECK (created_by IN ('CUSTOMER', 'PARTNER', 'ADMIN')),
  boat_id UUID REFERENCES boats(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

-- 9. Booking Status History
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Provider Payouts
CREATE TABLE provider_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id),
  amount BIGINT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Site Content
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT UNIQUE NOT NULL,
  content_fr TEXT NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Boat Availability
CREATE TABLE boat_availability (
  boat_id UUID PRIMARY KEY REFERENCES boats(id) ON DELETE CASCADE,
  settings JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published" ON experiences FOR SELECT USING (is_published = true);
CREATE POLICY "Provider reads own" ON experiences FOR SELECT USING (boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid()));
CREATE POLICY "Admin full access" ON experiences FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access bookings" ON bookings FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Provider reads assigned" ON bookings FOR SELECT USING (provider_id = auth.uid());
CREATE POLICY "Provider inserts own bookings" ON bookings FOR INSERT WITH CHECK (provider_id = auth.uid() AND created_by = 'PARTNER');
CREATE POLICY "Provider updates own bookings" ON bookings FOR UPDATE USING (provider_id = auth.uid()) WITH CHECK (provider_id = auth.uid());

ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads slots" ON time_slots FOR SELECT USING (true);
CREATE POLICY "Provider manages own" ON time_slots FOR ALL USING (experience_id IN (SELECT e.id FROM experiences e JOIN boats b ON e.boat_id = b.id WHERE b.provider_id = auth.uid()));

ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Provider reads own boats" ON boats FOR ALL USING (provider_id = auth.uid());
CREATE POLICY "Admin full boats" ON boats FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Admin manages destinations" ON destinations FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE boat_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads boat availability" ON boat_availability FOR SELECT USING (true);
CREATE POLICY "Provider manages own boat availability" ON boat_availability FOR ALL USING (boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid()));
CREATE POLICY "Admin manages boat availability" ON boat_availability FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
