-- Update the RLS policy to only show active stories (within 24 hours)
DROP POLICY IF EXISTS "Users can view all active stories" ON public.stories;

CREATE POLICY "Users can view active stories only" 
ON public.stories 
FOR SELECT 
USING (expires_at > now());