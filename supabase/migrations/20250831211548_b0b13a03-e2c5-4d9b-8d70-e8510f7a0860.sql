-- Update the SELECT policy for profile_photos to allow everyone to view profile photos
-- (since profile photos are meant to be public on profiles)
DROP POLICY IF EXISTS "Users can view their own profile photos" ON public.profile_photos;

-- Create a new policy that allows everyone to view profile photos
CREATE POLICY "Anyone can view profile photos" 
ON public.profile_photos 
FOR SELECT 
USING (true);

-- Also make sure there's a SELECT policy for storage objects that allows viewing profile photos
-- Update the storage policy to allow viewing all profile photos (since they're public)
DROP POLICY IF EXISTS "Users can view their own profile photos in storage" ON storage.objects;

CREATE POLICY "Anyone can view profile photos in storage" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos');

-- Ensure RLS is enabled on the profile_photos table
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;