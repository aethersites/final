-- Add image columns to flashcards table
ALTER TABLE public.flashcards 
ADD COLUMN question_image TEXT,
ADD COLUMN answer_image TEXT;