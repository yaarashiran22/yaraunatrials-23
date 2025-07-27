-- Create stories table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policies for stories
CREATE POLICY "Users can view all active stories" 
ON public.stories 
FOR SELECT 
USING (expires_at > now());

CREATE POLICY "Users can create their own stories" 
ON public.stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
ON public.stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_stories_user_active ON public.stories (user_id, expires_at) WHERE expires_at > now();

-- Create storage bucket for stories
INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true);

-- Create storage policies for stories
CREATE POLICY "Stories are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'stories');

CREATE POLICY "Users can upload their own stories" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own stories" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);