# Setup Storage Buckets for Files & Flashcards

## ⚠️ IMPORTANT: Database Setup Required

To enable file uploads and persistent storage, you need to create the storage bucket and policies in your Supabase project.

### 1. Create Storage Bucket
Go to your Supabase Dashboard → Storage → Create Bucket:
- **Bucket Name**: `user_files`
- **Public Bucket**: ✅ Enable (for file access)

### 2. Set Up RLS Policies
Go to SQL Editor in Supabase and run this SQL:

```sql
-- Create RLS policies for the user_files bucket
CREATE POLICY "Users can upload files to their own folder" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Update Flashcards Table (Optional - for images in flashcards)
If you want to support images in flashcards, run this SQL:

```sql
-- Add image columns to flashcards table
ALTER TABLE flashcards 
ADD COLUMN question_image TEXT,
ADD COLUMN answer_image TEXT;
```

## ✅ What's Fixed

### Files Page:
- ✅ **Real file uploads** to Supabase storage buckets
- ✅ **Persistent storage** - files survive page refreshes  
- ✅ **Proper database integration** with storage paths
- ✅ **File preview** from storage URLs
- ✅ **Download functionality** 
- ✅ **Drag & drop** uploads
- ✅ **Folder organization**
- ✅ **User-specific file isolation**

### Flashcards Page:
- ✅ **Database persistence** already working
- ✅ **Image upload support** for questions and answers
- ✅ **Storage bucket integration** for flashcard images
- ✅ **Proper image rendering** in cards

## 🚀 How It Works Now

### File Upload Process:
1. User uploads file → Supabase storage bucket
2. File metadata saved to database with storage path
3. Files are accessible via public URLs
4. User can preview, download, organize in folders

### Flashcard Images:
1. User adds image to flashcard → Supabase storage
2. Image URL saved to flashcard record
3. Images display in study mode and editor

Once you run the SQL setup above, everything will work perfectly!