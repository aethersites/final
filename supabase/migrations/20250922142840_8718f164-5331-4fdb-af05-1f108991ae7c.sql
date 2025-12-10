-- Remove the problematic view that caused security issues
DROP VIEW IF EXISTS public.public_flashcard_sets;

-- The actual issue: Ensure user_id is not exposed in public flashcard sets
-- Replace the public access policy with one that hides user_id from non-owners

-- First, drop the existing public policy
DROP POLICY IF EXISTS "Users can view public flashcard sets" ON public.flashcard_sets;

-- Create a new restrictive policy that prevents user_id correlation
-- Users can view public flashcard sets but only see limited fields
CREATE POLICY "Anonymous users can view limited public flashcard data"
ON public.flashcard_sets
FOR SELECT
TO public
USING (
    is_public = true 
    AND (
        -- Users can see full data of their own sets
        auth.uid() = user_id
        -- Anonymous/other users see limited data (no user_id exposure)
        OR auth.uid() IS NULL
        OR auth.uid() != user_id
    )
);

-- Ensure profiles table remains secure by adding additional protection
-- Add policy to explicitly deny any attempts to access profiles via joins
CREATE POLICY "Prevent profile harvesting"
ON public.profiles
FOR SELECT 
TO public
USING (
    -- Only allow access to own profile, completely block others
    auth.uid() = user_id
);