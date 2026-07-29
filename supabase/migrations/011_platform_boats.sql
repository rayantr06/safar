-- Platform-Managed Boats & Experiences
-- Allows platforms to own boats (provider_id = NULL) for admin-managed bookings.

ALTER TABLE boats ALTER COLUMN provider_id DROP NOT NULL;

-- Update RLS: Admin can see all boats
DROP POLICY IF EXISTS "Admin full access boats" ON boats;
CREATE POLICY "Admin full access boats" ON boats
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update RLS: Providers see their own boats OR platform boats (NULL provider_id)
DROP POLICY IF EXISTS "Provider manages own boats" ON boats;
CREATE POLICY "Provider manages own boats" ON boats
  FOR ALL USING (
    provider_id = auth.uid()
  );

-- Allow providers to SELECT platform boats (but not modify)
DROP POLICY IF EXISTS "Provider reads platform boats" ON boats;
CREATE POLICY "Provider reads platform boats" ON boats
  FOR SELECT USING (
    provider_id IS NULL
  );

-- Allow public to read platform boats (if active)
DROP POLICY IF EXISTS "Public reads active platform boats" ON boats;
CREATE POLICY "Public reads active platform boats" ON boats
  FOR SELECT USING (
    provider_id IS NULL AND is_active = true
  );
