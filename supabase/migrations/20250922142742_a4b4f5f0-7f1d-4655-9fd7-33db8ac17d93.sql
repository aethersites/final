-- Add an additional security layer to prevent any potential profile data exposure
-- Create a view that restricts flashcard set data for public access

-- Create a secure view for public flashcard sets without exposing user_ids
CREATE OR REPLACE VIEW public.public_flashcard_sets AS
SELECT 
    id,
    title,
    description,
    is_public,
    tags,
    created_at,
    updated_at
    -- Explicitly exclude user_id to prevent any correlation attacks
FROM public.flashcard_sets 
WHERE is_public = true;

-- Grant SELECT access to the view
GRANT SELECT ON public.public_flashcard_sets TO public;