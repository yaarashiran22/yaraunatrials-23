-- Create user_following table for following system (different from friends)
CREATE TABLE public.user_following (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_following ENABLE ROW LEVEL SECURITY;

-- Create policies for user_following
CREATE POLICY "Users can view their own following relationships" 
ON public.user_following 
FOR SELECT 
USING (auth.uid() = follower_id);

CREATE POLICY "Users can follow others" 
ON public.user_following 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" 
ON public.user_following 
FOR DELETE 
USING (auth.uid() = follower_id);

-- Create index for better performance
CREATE INDEX idx_user_following_follower_id ON public.user_following(follower_id);
CREATE INDEX idx_user_following_following_id ON public.user_following(following_id);

-- Add trigger for updated_at (reuse existing function)
CREATE TRIGGER update_user_following_updated_at
BEFORE UPDATE ON public.user_following
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();