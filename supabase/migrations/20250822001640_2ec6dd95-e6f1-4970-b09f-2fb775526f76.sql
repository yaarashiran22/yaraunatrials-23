-- Create table for neighborhood ideas
CREATE TABLE public.neighborhood_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  image_url TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  market TEXT DEFAULT 'israel',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.neighborhood_ideas ENABLE ROW LEVEL SECURITY;

-- Create policies for neighborhood ideas
CREATE POLICY "Anyone can view neighborhood ideas" 
ON public.neighborhood_ideas 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own neighborhood ideas" 
ON public.neighborhood_ideas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own neighborhood ideas" 
ON public.neighborhood_ideas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own neighborhood ideas" 
ON public.neighborhood_ideas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create table for idea votes
CREATE TABLE public.idea_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  idea_id UUID NOT NULL REFERENCES public.neighborhood_ideas(id) ON DELETE CASCADE,
  vote BOOLEAN NOT NULL, -- true for agree/yes, false for disagree/no
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, idea_id) -- Prevent duplicate votes from same user
);

-- Enable Row Level Security
ALTER TABLE public.idea_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for idea votes
CREATE POLICY "Anyone can view idea votes" 
ON public.idea_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own votes" 
ON public.idea_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.idea_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
ON public.idea_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_neighborhood_ideas_updated_at
BEFORE UPDATE ON public.neighborhood_ideas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();