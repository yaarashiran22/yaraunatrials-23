-- Fix security issue: Add explicit policy to deny anonymous access to notifications
CREATE POLICY "Deny anonymous access to notifications" 
ON public.notifications 
FOR ALL 
TO anon
USING (false);