-- ============================================
-- Migration: Update tables to use Firebase UID directly
-- ============================================
-- This migration ensures study_materials and tasks tables
-- use TEXT user_id (Firebase UID) instead of UUID references.
-- ============================================

-- 1. Alter study_materials to ensure user_id is TEXT
DO $$
BEGIN
  -- Check if user_id column exists and alter if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'study_materials' 
    AND column_name = 'user_id'
    AND data_type = 'uuid'
  ) THEN
    -- Drop foreign key constraint if exists
    ALTER TABLE public.study_materials 
      DROP CONSTRAINT IF EXISTS fk_user,
      DROP CONSTRAINT IF EXISTS study_materials_user_id_fkey;
    
    -- Alter column to TEXT
    ALTER TABLE public.study_materials 
      ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  END IF;
END $$;

-- 2. Alter tasks table to ensure user_id is TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tasks' 
    AND column_name = 'user_id'
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.tasks 
      DROP CONSTRAINT IF EXISTS fk_tasks_user,
      DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
    
    ALTER TABLE public.tasks 
      ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  END IF;
END $$;

-- 3. Update RLS policies for study_materials
DROP POLICY IF EXISTS "Users can view their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can insert their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can update their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can delete their own study materials" ON public.study_materials;

-- Permissive policies - app handles user_id validation
CREATE POLICY "study_materials_access" ON public.study_materials
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- 4. Update RLS policies for tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

CREATE POLICY "tasks_access" ON public.tasks
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- 5. Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_study_materials_user_id ON public.study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);

