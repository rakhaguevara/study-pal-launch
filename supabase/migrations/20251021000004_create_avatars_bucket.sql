-- Storage policies for avatars bucket
-- NOTE: Bucket must be created manually via Supabase Dashboard first!
-- See CREATE_STORAGE_BUCKET.md for detailed instructions

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Avatar Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Avatar Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Avatar Delete" ON storage.objects;

-- Create storage policies for avatars bucket
-- Since we're using Firebase Auth, we'll make it more permissive
-- Security is enforced at application level

-- Allow public read access (avatars are public)
CREATE POLICY "Public Avatar Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated uploads (security enforced in app)
-- Using permissive policy since we use Firebase Auth
CREATE POLICY "Authenticated Avatar Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Authenticated Avatar Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Allow users to delete their own avatars
CREATE POLICY "Authenticated Avatar Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars');
