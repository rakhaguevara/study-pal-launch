-- Create enum for learning styles
CREATE TYPE public.learning_style AS ENUM ('visual', 'auditory', 'reading_writing', 'kinesthetic', 'undetermined');

-- Create enum for quiz difficulty levels
CREATE TYPE public.quiz_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create enum for gender
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- Create user_profiles table (linked to Firebase auth via user_id string)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  date_of_birth DATE,
  age INTEGER,
  school TEXT,
  class TEXT,
  gender gender_type,
  learning_style learning_style DEFAULT 'undetermined',
  quiz_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_results table
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  visual_score INTEGER NOT NULL DEFAULT 0,
  audio_score INTEGER NOT NULL DEFAULT 0,
  text_score INTEGER NOT NULL DEFAULT 0,
  kinesthetic_score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  quiz_level quiz_level NOT NULL,
  time_taken INTEGER, -- in seconds
  date_taken TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recommendations table
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style learning_style NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL, -- 'video', 'article', 'podcast', 'interactive', etc.
  source_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (true); -- Users can see any profile for now (needed for dashboard stats)

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (true);

-- RLS Policies for quiz_results
CREATE POLICY "Users can view their own quiz results"
  ON public.quiz_results FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own quiz results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (true);

-- RLS Policies for recommendations (public read)
CREATE POLICY "Anyone can view recommendations"
  ON public.recommendations FOR SELECT
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate age from date of birth
CREATE OR REPLACE FUNCTION public.calculate_age(dob DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN DATE_PART('year', AGE(dob));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Insert sample recommendations for each learning style
INSERT INTO public.recommendations (style, title, description, content_type, source_url) VALUES
  ('visual', 'Mind Mapping Techniques', 'Learn to create effective visual mind maps for better retention', 'video', '#'),
  ('visual', 'Infographic Study Guide', 'Visual summaries of key concepts', 'article', '#'),
  ('visual', 'Color-Coded Notes Template', 'Download our visual note-taking template', 'interactive', '#'),
  
  ('auditory', 'Study Podcasts Library', 'Audio lessons on various subjects', 'podcast', '#'),
  ('auditory', 'Text-to-Speech Study Tools', 'Convert your notes to audio', 'interactive', '#'),
  ('auditory', 'Mnemonic Songs Collection', 'Learn through rhythm and music', 'podcast', '#'),
  
  ('reading_writing', 'Effective Note-Taking Methods', 'Cornell, Outline, and more techniques', 'article', '#'),
  ('reading_writing', 'Essay Writing Masterclass', 'Structured approach to writing', 'article', '#'),
  ('reading_writing', 'Study Guides & Summaries', 'Comprehensive text-based resources', 'article', '#'),
  
  ('kinesthetic', 'Interactive Science Labs', 'Hands-on virtual experiments', 'interactive', '#'),
  ('kinesthetic', 'Project-Based Learning Tasks', 'Learn by doing real projects', 'interactive', '#'),
  ('kinesthetic', 'Role-Play Study Sessions', 'Act out historical events and concepts', 'interactive', '#');