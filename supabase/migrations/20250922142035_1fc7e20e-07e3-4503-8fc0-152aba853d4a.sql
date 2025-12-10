-- Create the user_files storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('user_files', 'user_files', false);

-- Create RLS policies for the user_files bucket
-- Allow users to upload their own files
CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own files
CREATE POLICY "Users can view their own files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);