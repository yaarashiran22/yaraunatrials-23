-- Create a table for user friendships/follows
CREATE TABLE public.user_friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_friends ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own friends" 
ON public.user_friends 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add friends" 
ON public.user_friends 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own friends" 
ON public.user_friends 
FOR DELETE 
USING (auth.uid() = user_id);