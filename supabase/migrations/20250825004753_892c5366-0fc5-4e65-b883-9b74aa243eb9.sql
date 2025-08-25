-- Add RLS policy to allow community creators to delete their communities
CREATE POLICY "Creators can delete their communities" 
ON public.communities 
FOR DELETE 
USING (auth.uid() = creator_id);