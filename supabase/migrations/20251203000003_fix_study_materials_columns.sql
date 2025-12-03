-- ============================================
-- Fix study_materials table columns
-- ============================================
-- This migration ensures the study_materials table has all required columns
-- to fix PGRST204 "Could not find the 'description' column" error

-- Add missing columns if they don't exist
ALTER TABLE public.study_materials
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.study_materials
  ADD COLUMN IF NOT EXISTS resource_url TEXT;

ALTER TABLE public.study_materials
  ADD COLUMN IF NOT EXISTS subject TEXT;

-- Ensure user_id is TEXT (for Firebase UID)
-- Only run if column exists and is UUID type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'study_materials' 
    AND column_name = 'user_id'
    AND data_type = 'uuid'
  ) THEN
    -- Drop any foreign key constraint first
    ALTER TABLE public.study_materials 
      DROP CONSTRAINT IF EXISTS fk_user CASCADE;
    ALTER TABLE public.study_materials 
      DROP CONSTRAINT IF EXISTS study_materials_user_id_fkey CASCADE;
    
    -- Convert to TEXT
    ALTER TABLE public.study_materials 
      ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  END IF;
END $$;

-- Make sure RLS allows operations
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can insert their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can update their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can delete their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_select_policy" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_insert_policy" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_update_policy" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_delete_policy" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_access" ON public.study_materials;

-- Create permissive policy (app handles user validation)
CREATE POLICY "allow_all_study_materials" ON public.study_materials
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Same for tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_access" ON public.tasks;

CREATE POLICY "allow_all_tasks" ON public.tasks
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

