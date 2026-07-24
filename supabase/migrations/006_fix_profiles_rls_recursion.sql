-- Safar DZ — Fix infinite recursion in profiles RLS policy
-- "Admin reads all profiles" (004_schema_hardening.sql) checks admin status
-- by querying profiles from within a policy ON profiles, which makes Postgres
-- re-evaluate the same RLS policy while evaluating itself (error 42P17:
-- infinite recursion detected in policy for relation "profiles"). Every
-- profile lookup for every user has been failing because of this, which is
-- why role-based redirects (admin/provider/client) always fell back to the
-- default. A SECURITY DEFINER function bypasses RLS for the internal lookup,
-- breaking the recursion.

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

DROP POLICY IF EXISTS "Admin reads all profiles" ON profiles;
CREATE POLICY "Admin reads all profiles" ON profiles FOR SELECT USING (public.is_admin());
