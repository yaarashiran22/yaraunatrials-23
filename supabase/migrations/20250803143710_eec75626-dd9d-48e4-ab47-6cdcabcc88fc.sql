-- Create a table for friends picture galleries
CREATE TABLE public.friends_picture_galleries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.friends_picture_galleries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view friends picture galleries" 
ON public.friends_picture_galleries 
FOR SELECT 
USING ((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM user_friends
  WHERE ((user_friends.user_id = auth.uid()) AND (user_friends.friend_id = friends_picture_galleries.user_id)))));

CREATE POLICY "Users can create their own picture galleries" 
ON public.friends_picture_galleries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own picture galleries" 
ON public.friends_picture_galleries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own picture galleries" 
ON public.friends_picture_galleries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_friends_picture_galleries_updated_at
BEFORE UPDATE ON public.friends_picture_galleries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();