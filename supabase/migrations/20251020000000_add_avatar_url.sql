-- Add avatar_url column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN public.user_profiles.avatar_url IS 'URL to the user profile picture stored in Supabase Storage';


