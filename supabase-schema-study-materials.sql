-- ============================================
-- StudyPal: Study Materials Table Schema Fix
-- ============================================
-- Run this SQL in Supabase SQL Editor to fix PGRST204 error:
-- "Could not find the 'description' column of 'study_materials'"
-- ============================================

-- 1. Add missing columns
ALTER TABLE public.study_materials
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.study_materials
  ADD COLUMN IF NOT EXISTS resource_url TEXT;

ALTER TABLE public.study_materials
  ADD COLUMN IF NOT EXISTS subject TEXT;

-- 2. If user_id is UUID, convert to TEXT for Firebase UID
-- First check if it needs conversion:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'study_materials' AND column_name = 'user_id';

-- If data_type is 'uuid', run:
-- ALTER TABLE public.study_materials DROP CONSTRAINT IF EXISTS fk_user CASCADE;
-- ALTER TABLE public.study_materials ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 3. Ensure RLS is enabled with permissive policy
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can insert their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can update their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can delete their own study materials" ON public.study_materials;

-- Create permissive policy (app handles user validation via WHERE clause)
DROP POLICY IF EXISTS "allow_all_study_materials" ON public.study_materials;
CREATE POLICY "allow_all_study_materials" ON public.study_materials
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- 4. Verify the table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'study_materials'
-- ORDER BY ordinal_position;

-- Expected columns:
-- id           | uuid      | NO
-- user_id      | text      | NO
-- title        | text      | NO
-- subject      | text      | YES
-- description  | text      | YES
-- resource_url | text      | YES
-- created_at   | timestamp | YES (default now())
-- updated_at   | timestamp | YES (default now())
-- (plus any legacy columns like content, summary, etc.)

