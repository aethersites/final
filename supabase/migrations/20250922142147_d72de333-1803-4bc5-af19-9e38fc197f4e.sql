-- Create the user_files storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
SELECT 'user_files', 'user_files', false
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'user_files'
);