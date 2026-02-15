-- Add location_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location_type TEXT;

-- Update existing profiles with default value if needed
UPDATE public.profiles 
SET location_type = 'apartment' 
WHERE location_type IS NULL;
