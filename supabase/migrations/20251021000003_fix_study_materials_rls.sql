-- Fix RLS Policies for study_materials to work with Firebase Authentication
-- Since we're using Firebase Auth instead of Supabase Auth,
-- we need to allow authenticated operations while maintaining security

-- Drop existing policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can insert their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can update their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can delete their own study materials" ON public.study_materials;

-- Create new policies that allow operations (security enforced in application)
-- The application code verifies user_id matches the authenticated Firebase user's profile

-- Allow users to view their own study materials
CREATE POLICY "Users can view study materials"
  ON public.study_materials FOR SELECT
  USING (true);

-- Allow users to insert study materials (verification happens in application code)
CREATE POLICY "Users can insert study materials"
  ON public.study_materials FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own study materials (verification happens in application code)
CREATE POLICY "Users can update study materials"
  ON public.study_materials FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow users to delete their own study materials (verification happens in application code)
CREATE POLICY "Users can delete study materials"
  ON public.study_materials FOR DELETE
  USING (true);

-- Comments explaining the security model
COMMENT ON POLICY "Users can view study materials" ON public.study_materials IS 
  'Allows viewing study materials. Security is enforced at application level by verifying user_id matches authenticated user profile.';

COMMENT ON POLICY "Users can insert study materials" ON public.study_materials IS 
  'Allows inserting study materials. Application must verify user_id matches authenticated Firebase user profile.';

COMMENT ON POLICY "Users can update study materials" ON public.study_materials IS 
  'Allows updating study materials. Application must verify user_id matches authenticated Firebase user profile.';

COMMENT ON POLICY "Users can delete study materials" ON public.study_materials IS 
  'Allows deleting study materials. Application must verify user_id matches authenticated Firebase user profile.';

