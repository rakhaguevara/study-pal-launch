-- Create study_materials table
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  learning_style learning_style NOT NULL,
  youtube_links TEXT[] DEFAULT '{}',
  article_links TEXT[] DEFAULT '{}',
  reference_links JSONB DEFAULT '{}',
  page_length INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_study_materials_user_id ON public.study_materials(user_id);
CREATE INDEX idx_study_materials_created_at ON public.study_materials(created_at DESC);

-- Enable RLS
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_materials
CREATE POLICY "Users can view their own study materials"
  ON public.study_materials FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their own study materials"
  ON public.study_materials FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own study materials"
  ON public.study_materials FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own study materials"
  ON public.study_materials FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()::text
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_study_materials_updated_at()
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

-- Trigger for study_materials updated_at
CREATE TRIGGER update_study_materials_updated_at
  BEFORE UPDATE ON public.study_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_study_materials_updated_at();

COMMENT ON TABLE public.study_materials IS 'Stores AI-generated study materials with references and links';
COMMENT ON COLUMN public.study_materials.youtube_links IS 'Array of YouTube video URLs related to the material';
COMMENT ON COLUMN public.study_materials.article_links IS 'Array of article URLs from various sources';
COMMENT ON COLUMN public.study_materials.reference_links IS 'JSONB object containing metadata for references';
COMMENT ON COLUMN public.study_materials.page_length IS 'Number of pages/paragraphs for the generated summary';

