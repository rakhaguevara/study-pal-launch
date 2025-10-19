-- Create focus_sessions table for tracking daily study activity
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own focus sessions
CREATE POLICY "Users can view own focus sessions" 
ON public.focus_sessions 
FOR SELECT 
USING (
  user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
  )
);

-- Users can insert their own focus sessions
CREATE POLICY "Users can insert own focus sessions" 
ON public.focus_sessions 
FOR INSERT 
WITH CHECK (
  user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
  )
);

-- Users can update their own focus sessions
CREATE POLICY "Users can update own focus sessions" 
ON public.focus_sessions 
FOR UPDATE 
USING (
  user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
  )
);

-- Create index for better query performance
CREATE INDEX idx_focus_sessions_user_date ON public.focus_sessions(user_id, session_date DESC);

-- Create a function to aggregate daily focus time
CREATE OR REPLACE FUNCTION get_daily_focus_minutes(p_user_id UUID, p_date DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(duration_minutes) 
     FROM focus_sessions 
     WHERE user_id = p_user_id 
     AND session_date = p_date),
    0
  );
END;
$$;