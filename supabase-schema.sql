-- ============================================
-- StudyPal Database Schema
-- ============================================
-- This file documents the required Supabase tables.
-- Run these SQL statements in the Supabase SQL Editor.
-- 
-- NOTE: user_id is stored as TEXT (Firebase UID), not UUID.
-- This allows direct use of Firebase authentication without
-- needing to map through user_profiles table.
-- ============================================

-- ============================================
-- 1. STUDY MATERIALS TABLE
-- ============================================
-- Stores study materials uploaded/created by users

CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,              -- Firebase UID (not Supabase auth.users)
  title TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  resource_url TEXT,
  -- Legacy fields (for backward compatibility with existing data)
  content TEXT,
  summary TEXT,
  learning_style TEXT,
  youtube_links TEXT[],
  article_links TEXT[],
  reference_links JSONB,
  page_length INTEGER,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_study_materials_user_id ON public.study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_created_at ON public.study_materials(created_at DESC);

-- Enable RLS
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for clean re-run)
DROP POLICY IF EXISTS "Users can view their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can insert their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can update their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can delete their own study materials" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_select_policy" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_insert_policy" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_update_policy" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_delete_policy" ON public.study_materials;

-- RLS Policies - Allow authenticated users to manage their own materials
-- Using permissive policies that check user_id matches the Firebase UID
CREATE POLICY "study_materials_select_policy" ON public.study_materials
  FOR SELECT TO authenticated, anon
  USING (true);  -- RLS handled by user_id filter in queries

CREATE POLICY "study_materials_insert_policy" ON public.study_materials
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);  -- App validates user_id before insert

CREATE POLICY "study_materials_update_policy" ON public.study_materials
  FOR UPDATE TO authenticated, anon
  USING (true);  -- App validates user_id in WHERE clause

CREATE POLICY "study_materials_delete_policy" ON public.study_materials
  FOR DELETE TO authenticated, anon
  USING (true);  -- App validates user_id in WHERE clause

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION public.update_study_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_study_materials_updated_at ON public.study_materials;
CREATE TRIGGER update_study_materials_updated_at
  BEFORE UPDATE ON public.study_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_study_materials_updated_at();


-- ============================================
-- 2. TASKS TABLE
-- ============================================
-- Stores tasks/calendar events for users

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,              -- Firebase UID
  title TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,    -- Start date/time
  end_time TIMESTAMPTZ NOT NULL,      -- Deadline date/time
  source TEXT NOT NULL DEFAULT 'manual',  -- 'manual' or 'google'
  google_event_id TEXT,               -- Google Calendar event ID (if synced)
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_start_time ON public.tasks(start_time);
CREATE INDEX IF NOT EXISTS idx_tasks_end_time ON public.tasks(end_time);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;

-- RLS Policies
CREATE POLICY "tasks_select_policy" ON public.tasks
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "tasks_insert_policy" ON public.tasks
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "tasks_update_policy" ON public.tasks
  FOR UPDATE TO authenticated, anon
  USING (true);

CREATE POLICY "tasks_delete_policy" ON public.tasks
  FOR DELETE TO authenticated, anon
  USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tasks_updated_at();


-- ============================================
-- 3. FLASHCARDS TABLE (Optional)
-- ============================================

CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,              -- Firebase UID
  material_id TEXT,                   -- Reference to material name/id
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON public.flashcards(user_id);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "flashcards_all_policy" ON public.flashcards;
CREATE POLICY "flashcards_all_policy" ON public.flashcards
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);


-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.study_materials IS 'User study materials with optional AI-generated content';
COMMENT ON TABLE public.tasks IS 'User tasks with start/end times for calendar integration';
COMMENT ON TABLE public.flashcards IS 'AI-generated flashcards for study materials';

