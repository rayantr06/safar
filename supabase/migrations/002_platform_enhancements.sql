-- Safar DZ — Platform Enhancements Migration
-- Adds accommodations, notifications, and extends existing tables

-- ==========================================
-- EXTEND EXPERIENCES TABLE
-- ==========================================

ALTER TABLE experiences ADD COLUMN IF NOT EXISTS included_services TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS requirements TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS departure_location TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS route_description TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS main_image_url TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 0;

-- Update type check to include kayak, paddle, other
ALTER TABLE experiences DROP CONSTRAINT IF EXISTS experiences_type_check;
ALTER TABLE experiences ADD CONSTRAINT experiences_type_check
  CHECK (type IN ('private', 'shared', 'jetski', 'kayak', 'paddle', 'quads', 'other'));

-- Update boat type check similarly
ALTER TABLE boats DROP CONSTRAINT IF EXISTS boats_type_check;
ALTER TABLE boats ADD CONSTRAINT boats_type_check
  CHECK (type IN ('private', 'shared', 'jetski', 'kayak', 'paddle', 'quads', 'other'));

-- ==========================================
-- EXTEND DESTINATIONS TABLE
-- ==========================================

ALTER TABLE destinations ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- ==========================================
-- ACCOMMODATIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('villa', 'appartement', 'maison_hotes', 'hotel', 'studio')),
  wilaya TEXT DEFAULT 'Béjaïa',
  city TEXT,
  address TEXT,
  description TEXT,
  short_description TEXT,
  location TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  promo_price INTEGER,
  currency TEXT DEFAULT 'DA',
  pricing_type TEXT DEFAULT 'night',
  image_url TEXT,
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  contact_phone TEXT,
  whatsapp_phone TEXT,
  max_guests INTEGER DEFAULT 4,
  rooms_count INTEGER DEFAULT 1,
  beds_count INTEGER DEFAULT 1,
  bathrooms_count INTEGER DEFAULT 1,
  amenities JSONB DEFAULT '[]',
  custom_amenities JSONB DEFAULT '[]',
  booking_type TEXT DEFAULT 'whatsapp' CHECK (booking_type IN ('whatsapp', 'platform', 'both')),
  min_stay_nights INTEGER DEFAULT 1,
  blocked_dates JSONB DEFAULT '[]',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- NOTIFICATIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- NOTIFICATION SETTINGS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT UNIQUE NOT NULL,
  dashboard_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default notification settings
INSERT INTO notification_settings (event_type, dashboard_enabled) VALUES
  ('new_reservation', true),
  ('cancellation', true),
  ('partner_request', true),
  ('new_partner', true),
  ('payment_status', true)
ON CONFLICT (event_type) DO NOTHING;

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active accommodations" ON accommodations FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manages accommodations" ON accommodations FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User reads own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin manages all notifications" ON notifications FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages notification settings" ON notification_settings FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Public reads notification settings" ON notification_settings FOR SELECT USING (true);
