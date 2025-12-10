-- Fix the critical security issue: mismatched bucket names
-- Remove the unused bucket with hyphen
DELETE FROM storage.buckets WHERE id = 'user-files';

-- Drop the old policies that were protecting the wrong bucket
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create correct RLS policies for the actual 'user_files' bucket being used in code
CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);