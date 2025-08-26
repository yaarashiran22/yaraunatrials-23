-- Fix RLS policy for recommendation_agreements to require authentication
DROP POLICY "Users can view all agreements" ON public.recommendation_agreements;

CREATE POLICY "Authenticated users can view all agreements" 
ON public.recommendation_agreements 
FOR SELECT 
USING (auth.uid() IS NOT NULL);