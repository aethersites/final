-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create main goals table
CREATE TABLE public.main_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  goal_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create folders table
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-blue-500',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create files table
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcard_sets table
CREATE TABLE public.flashcard_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcards table
CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flashcard_set_id UUID NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.main_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Main goals policies
CREATE POLICY "Users can view their own main goal" ON public.main_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own main goal" ON public.main_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own main goal" ON public.main_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own main goal" ON public.main_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Folders policies
CREATE POLICY "Users can view their own folders" ON public.folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" ON public.folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" ON public.folders
  FOR DELETE USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can view their own files" ON public.files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files" ON public.files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" ON public.files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" ON public.files
  FOR DELETE USING (auth.uid() = user_id);

-- Flashcard sets policies
CREATE POLICY "Users can view their own flashcard sets" ON public.flashcard_sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public flashcard sets" ON public.flashcard_sets
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own flashcard sets" ON public.flashcard_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard sets" ON public.flashcard_sets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcard sets" ON public.flashcard_sets
  FOR DELETE USING (auth.uid() = user_id);

-- Flashcards policies
CREATE POLICY "Users can view flashcards from their sets" ON public.flashcards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE id = flashcard_set_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view flashcards from public sets" ON public.flashcards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE id = flashcard_set_id 
      AND is_public = true
    )
  );

CREATE POLICY "Users can insert flashcards to their sets" ON public.flashcards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE id = flashcard_set_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update flashcards in their sets" ON public.flashcards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE id = flashcard_set_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete flashcards from their sets" ON public.flashcards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE id = flashcard_set_id 
      AND user_id = auth.uid()
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('user-files', 'user-files', false);

-- Storage policies for user files
CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_main_goals_updated_at
  BEFORE UPDATE ON public.main_goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_flashcard_sets_updated_at
  BEFORE UPDATE ON public.flashcard_sets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();