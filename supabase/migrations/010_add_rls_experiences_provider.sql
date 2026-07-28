-- Migration 010: Add INSERT and UPDATE RLS policies for providers on `experiences`
-- Phase 3.5: Partners could not create or edit their own experiences via the UI
-- because only SELECT policies existed for providers. The server actions 
-- toggleExperienceStatus, saveExperience, and createExperience use the
-- user-session client (anon key) which is subject to RLS. Without these
-- policies, mutations would be denied at the database level.

-- Allow providers to INSERT experiences linked to their own boats
CREATE POLICY "Provider inserts own experiences" ON experiences
  FOR INSERT WITH CHECK (
    boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid())
  );

-- Allow providers to UPDATE experiences linked to their own boats
CREATE POLICY "Provider updates own experiences" ON experiences
  FOR UPDATE USING (
    boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid())
  )
  WITH CHECK (
    boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid())
  );
