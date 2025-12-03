-- Create google_tokens table for storing OAuth tokens
CREATE TABLE IF NOT EXISTS public.google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_google_tokens_user FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_google_tokens_user_id ON public.google_tokens(user_id);

-- Enable RLS
ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own google tokens" ON public.google_tokens;
DROP POLICY IF EXISTS "Users can insert their own google tokens" ON public.google_tokens;
DROP POLICY IF EXISTS "Users can update their own google tokens" ON public.google_tokens;
DROP POLICY IF EXISTS "Users can delete their own google tokens" ON public.google_tokens;

-- RLS Policies for google_tokens
CREATE POLICY "Users can view their own google tokens"
  ON public.google_tokens FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their own google tokens"
  ON public.google_tokens FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own google tokens"
  ON public.google_tokens FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own google tokens"
  ON public.google_tokens FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_google_tokens_updated_at()
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
DROP TRIGGER IF EXISTS update_google_tokens_updated_at ON public.google_tokens;

-- Trigger for google_tokens updated_at
CREATE TRIGGER update_google_tokens_updated_at
  BEFORE UPDATE ON public.google_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_google_tokens_updated_at();

COMMENT ON TABLE public.google_tokens IS 'Stores Google OAuth tokens for Calendar integration';
COMMENT ON COLUMN public.google_tokens.access_token IS 'OAuth access token for Google API calls';
COMMENT ON COLUMN public.google_tokens.refresh_token IS 'OAuth refresh token to get new access tokens';
COMMENT ON COLUMN public.google_tokens.expires_at IS 'When the access token expires';

