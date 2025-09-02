-- Create instagram-stories storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('instagram-stories', 'instagram-stories', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public access to instagram stories
CREATE POLICY "Instagram stories are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'instagram-stories');

-- Create policy for authenticated users to upload their own stories
CREATE POLICY "Users can upload their own instagram stories" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'instagram-stories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);