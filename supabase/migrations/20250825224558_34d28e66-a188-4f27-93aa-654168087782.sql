-- Fix security issue: Update direct messages policies to only allow authenticated users
DROP POLICY IF EXISTS "Users can send messages to others" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can update messages they sent" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can delete messages they sent" ON public.direct_messages;

-- Create policies that only allow authenticated users
CREATE POLICY "Authenticated users can send messages to others" 
ON public.direct_messages 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Authenticated users can view messages they sent or received" 
ON public.direct_messages 
FOR SELECT 
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can update messages they sent" 
ON public.direct_messages 
FOR UPDATE 
TO authenticated
USING (auth.uid() = sender_id);

CREATE POLICY "Authenticated users can delete messages they sent" 
ON public.direct_messages 
FOR DELETE 
TO authenticated
USING (auth.uid() = sender_id);