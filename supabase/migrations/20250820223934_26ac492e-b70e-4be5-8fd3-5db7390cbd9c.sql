-- Change specialty field from text to text array to allow multiple specialties
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS specialty;

-- Add specialties as an array field
ALTER TABLE public.profiles 
ADD COLUMN specialties text[] DEFAULT '{}';

-- Add a comment to document the change
COMMENT ON COLUMN public.profiles.specialties IS 'Array of user specialties/expertise areas';