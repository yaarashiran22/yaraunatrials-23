-- Update smallprofiles table to use UUID for id (matching profiles table)
ALTER TABLE public.smallprofiles ALTER COLUMN id TYPE uuid USING id::text::uuid;

-- Add foreign key constraint to link with profiles
ALTER TABLE public.smallprofiles 
ADD CONSTRAINT smallprofiles_id_fkey 
FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;