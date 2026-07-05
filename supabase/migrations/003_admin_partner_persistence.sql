-- Safar DZ — Admin & Partner Persistence Migration
-- Adds columns needed by the partner-management UI and enables RLS on two
-- tables that currently have none at all (providers, site_content — meaning
-- any authenticated user currently has unrestricted read/write access to them
-- via Supabase's default grants).

ALTER TABLE providers ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed'));
ALTER TABLE providers ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT false;

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Provider reads/updates own row" ON providers FOR ALL USING (id = auth.uid());
CREATE POLICY "Admin full access providers" ON providers FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads site content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admin manages site content" ON site_content FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
