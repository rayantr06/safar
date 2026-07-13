-- Safar DZ — Media Storage Bucket
-- Creates a single public bucket for all entity images (experiences,
-- destinations, accommodations, CMS assets), uploaded via the app's
-- image-uploader component and web/src/lib/actions/media.ts.
-- Path convention: {entity}/{entity_id}/{uuid}.{ext}

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public can read (all current image usage is public marketing content).
DROP POLICY IF EXISTS "Public reads media" ON storage.objects;
CREATE POLICY "Public reads media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Only admins/providers (authenticated app users) may upload or remove
-- files. Uploads go through the service-role admin client
-- (web/src/lib/actions/media.ts), so this mainly guards against direct
-- anon-key access to the bucket.
DROP POLICY IF EXISTS "Admin/provider uploads media" ON storage.objects;
CREATE POLICY "Admin/provider uploads media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'provider'))
  );

DROP POLICY IF EXISTS "Admin/provider deletes media" ON storage.objects;
CREATE POLICY "Admin/provider deletes media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'provider'))
  );
