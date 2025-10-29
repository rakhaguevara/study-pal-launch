-- Create flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  material_id TEXT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add quiz improvements columns
ALTER TABLE public.quiz_results 
ADD COLUMN IF NOT EXISTS material_name TEXT,
ADD COLUMN IF NOT EXISTS score_percent NUMERIC(5,2);

-- Enable RLS for flashcards
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for flashcards
CREATE POLICY "Users can view their own flashcards"
  ON public.flashcards FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own flashcards"
  ON public.flashcards FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own flashcards"
  ON public.flashcards FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own flashcards"
  ON public.flashcards FOR DELETE
  USING (auth.role() = 'authenticated');

-- Function to automatically update updated_at timestamp for flashcards
CREATE OR REPLACE FUNCTION public.update_flashcards_updated_at()
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

-- Trigger for flashcards updated_at
CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_flashcards_updated_at();

COMMENT ON TABLE public.flashcards IS 'Stores AI-generated flashcards for study materials';
COMMENT ON COLUMN public.flashcards.material_id IS 'Name or identifier of the study material';


