-- Create friends feed posts table
CREATE TABLE public.friends_feed_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.friends_feed_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for friends feed posts
CREATE POLICY "Users can create their own friends feed posts" 
ON public.friends_feed_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view friends feed posts" 
ON public.friends_feed_posts 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.user_friends 
    WHERE user_friends.user_id = auth.uid() 
    AND user_friends.friend_id = friends_feed_posts.user_id
  )
);

CREATE POLICY "Users can update their own friends feed posts" 
ON public.friends_feed_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own friends feed posts" 
ON public.friends_feed_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_friends_feed_posts_updated_at
BEFORE UPDATE ON public.friends_feed_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();