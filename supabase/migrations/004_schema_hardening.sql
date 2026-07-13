-- Safar DZ — Schema & Security Hardening Migration
-- Adds client<->booking linkage, widens the role model to include 'client',
-- fixes a public PII leak on profiles, adds missing indexes, links
-- accommodations into the destination/booking graph, and introduces a
-- Draft/Published/Hidden/Archived content lifecycle alongside the existing
-- boolean flags (kept in sync via triggers so no existing query/RLS policy
-- that filters on is_published/is_active breaks).

-- ==========================================
-- 1. CLIENT <-> BOOKING LINK
-- ==========================================

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id);

DROP POLICY IF EXISTS "Client reads own bookings" ON bookings;
CREATE POLICY "Client reads own bookings" ON bookings FOR SELECT USING (client_id = auth.uid());

-- ==========================================
-- 2. ROLE MODEL — ALLOW 'client'
-- ==========================================

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'provider', 'client'));

-- ==========================================
-- 3. PROFILES RLS — REMOVE PUBLIC READ LEAK
-- ==========================================
-- Previously "Public read profiles" USING (true) exposed every user's
-- full_name/phone/avatar_url to any anon client. Restrict to own row + admin.
-- Every existing consumer in the app already filters `.eq("id", user.id)` or
-- uses the service-role admin client, so this is not expected to break reads.

DROP POLICY IF EXISTS "Public read profiles" ON profiles;

DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Admin reads all profiles" ON profiles;
CREATE POLICY "Admin reads all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ==========================================
-- 4. ACCOMMODATION RELATIONSHIPS
-- ==========================================

ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS destination_id UUID REFERENCES destinations(id);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS accommodation_id UUID REFERENCES accommodations(id);

-- A booking must reference an experience or an accommodation (or both is
-- disallowed by neither being required to be exclusive — just at least one).
ALTER TABLE bookings ALTER COLUMN experience_id DROP NOT NULL;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_experience_or_accommodation_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_experience_or_accommodation_check
  CHECK (experience_id IS NOT NULL OR accommodation_id IS NOT NULL);

-- ==========================================
-- 5. INDEXES (none existed anywhere before this migration)
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_accommodation_id ON bookings(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_experiences_is_published ON experiences(is_published);
CREATE INDEX IF NOT EXISTS idx_experiences_boat_id ON experiences(boat_id);
CREATE INDEX IF NOT EXISTS idx_experiences_destination_id ON experiences(destination_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_experience_id ON time_slots(experience_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_destination_id ON accommodations(destination_id);
CREATE INDEX IF NOT EXISTS idx_boats_provider_id ON boats(provider_id);

-- ==========================================
-- 6. CONTENT STATUS LIFECYCLE (draft / published / hidden / archived)
-- ==========================================
-- Added alongside is_published/is_active rather than replacing them: those
-- booleans are still read by existing RLS policies and app queries. A
-- trigger keeps them derived from `status` so both stay consistent. A later
-- cleanup migration will drop the booleans once every read path has moved
-- to `status` directly.

ALTER TABLE experiences ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'hidden', 'archived'));
UPDATE experiences SET status = CASE WHEN is_published THEN 'published' ELSE 'draft' END;

ALTER TABLE destinations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'hidden', 'archived'));
UPDATE destinations SET status = CASE WHEN is_active THEN 'published' ELSE 'draft' END;

ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'hidden', 'archived'));
UPDATE accommodations SET status = CASE WHEN is_active THEN 'published' ELSE 'draft' END;

CREATE OR REPLACE FUNCTION sync_experience_status_bool() RETURNS TRIGGER AS $$
BEGIN
  NEW.is_published := (NEW.status = 'published');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_experience_status ON experiences;
CREATE TRIGGER trg_sync_experience_status
  BEFORE INSERT OR UPDATE OF status ON experiences
  FOR EACH ROW EXECUTE FUNCTION sync_experience_status_bool();

CREATE OR REPLACE FUNCTION sync_destination_status_bool() RETURNS TRIGGER AS $$
BEGIN
  NEW.is_active := (NEW.status = 'published');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_destination_status ON destinations;
CREATE TRIGGER trg_sync_destination_status
  BEFORE INSERT OR UPDATE OF status ON destinations
  FOR EACH ROW EXECUTE FUNCTION sync_destination_status_bool();

CREATE OR REPLACE FUNCTION sync_accommodation_status_bool() RETURNS TRIGGER AS $$
BEGIN
  NEW.is_active := (NEW.status = 'published');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_accommodation_status ON accommodations;
CREATE TRIGGER trg_sync_accommodation_status
  BEFORE INSERT OR UPDATE OF status ON accommodations
  FOR EACH ROW EXECUTE FUNCTION sync_accommodation_status_bool();

CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences(status);
CREATE INDEX IF NOT EXISTS idx_destinations_status ON destinations(status);
CREATE INDEX IF NOT EXISTS idx_accommodations_status ON accommodations(status);
