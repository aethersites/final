-- Fix search_path for the remaining function
ALTER FUNCTION public.handle_updated_at() SET search_path = public;