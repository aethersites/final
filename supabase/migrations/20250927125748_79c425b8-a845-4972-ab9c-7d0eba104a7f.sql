-- Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);