-- Add target_user column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN target_user TEXT;