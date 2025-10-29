-- Fix column name from 'references' (reserved keyword) to 'reference_links'
-- This migration handles both cases: if column exists or doesn't exist

-- Check if column 'references' exists and rename it
DO $$
BEGIN
    -- Check if column 'references' exists in study_materials table
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'study_materials' 
        AND column_name = 'references'
    ) THEN
        -- this column exists, rename it
        ALTER TABLE public.study_materials 
        RENAME COLUMN "references" TO reference_links;
        
        RAISE NOTICE 'Renamed column "references" to reference_links';
    ELSE
        -- Column doesn't exist, check if reference_links exists
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'study_materials' 
            AND column_name = 'reference_links'
        ) THEN
            -- Neither exists, create it
            ALTER TABLE public.study_materials 
            ADD COLUMN reference_links JSONB DEFAULT '{}';
            
            RAISE NOTICE 'Created column reference_links';
        ELSE
            RAISE NOTICE 'Column reference_links already exists';
        END IF;
    END IF;
END $$;

-- Update comment
COMMENT ON COLUMN public.study_materials.reference_links IS 'JSONB object containing metadata for references';

