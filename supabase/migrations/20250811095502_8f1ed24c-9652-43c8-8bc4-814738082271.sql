-- Update the RLS policy to allow everyone to view all picture galleries
-- This makes it work like a public feed where anyone can see photos uploaded by others

DROP POLICY IF EXISTS "Users can view friends picture galleries" ON public.friends_picture_galleries;

CREATE POLICY "Anyone can view picture galleries" 
ON public.friends_picture_galleries 
FOR SELECT 
USING (true);