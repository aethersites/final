-- Fix the RLS policies properly
-- The issue is that we need to restore the simple public flashcard sets policy
-- and ensure profiles are completely isolated

-- Drop the confusing policy I created
DROP POLICY IF EXISTS "Anonymous users can view limited public flashcard data" ON public.flashcard_sets;

-- Drop the duplicate profile policy  
DROP POLICY IF EXISTS "Prevent profile harvesting" ON public.profiles;

-- Restore the original, simple public flashcard sets policy
CREATE POLICY "Users can view public flashcard sets" 
ON public.flashcard_sets 
FOR SELECT 
USING (is_public = true);

-- The key insight: Add column-level security by creating a function that 
-- strips sensitive data from public flashcard sets for non-owners
CREATE OR REPLACE FUNCTION public.get_public_flashcard_set_safe(set_id uuid)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    is_public boolean,
    tags text[],
    created_at timestamptz,
    updated_at timestamptz
    -- Note: user_id is NOT returned for non-owners
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT 
        fs.id,
        fs.title,
        fs.description,
        fs.is_public,
        fs.tags,
        fs.created_at,
        fs.updated_at
    FROM flashcard_sets fs
    WHERE fs.id = set_id 
    AND fs.is_public = true;
$$;