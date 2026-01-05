-- Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN goal text,
ADD COLUMN stage text,
ADD COLUMN industry text,
ADD COLUMN use_case text,
ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;

-- Update RLS policy to allow users to update their own profile (already exists but ensure it covers new columns)