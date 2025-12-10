-- Fix image rendering by making the user_files bucket public
-- This is needed because getPublicUrl() only works with public buckets
UPDATE storage.buckets 
SET public = true 
WHERE id = 'user_files';