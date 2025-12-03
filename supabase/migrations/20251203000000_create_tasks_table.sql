-- Create tasks table for task management and Google Calendar integration
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'google')),
  google_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_start_time ON public.tasks(start_time);
CREATE INDEX IF NOT EXISTS idx_tasks_end_time ON public.tasks(end_time);
CREATE INDEX IF NOT EXISTS idx_tasks_source ON public.tasks(source);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- RLS Policies for tasks - using firebase_uid lookup
CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_tasks_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;

-- Trigger for tasks updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tasks_updated_at();

COMMENT ON TABLE public.tasks IS 'Stores user tasks from manual entry and Google Calendar sync';
COMMENT ON COLUMN public.tasks.source IS 'Source of the task: manual (created in app) or google (synced from Google Calendar)';
COMMENT ON COLUMN public.tasks.google_event_id IS 'Google Calendar event ID for synced tasks';

