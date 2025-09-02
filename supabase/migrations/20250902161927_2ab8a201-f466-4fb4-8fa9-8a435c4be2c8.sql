-- Create storage bucket for generated Instagram stories
INSERT INTO storage.buckets (id, name, public) 
VALUES ('instagram-stories', 'instagram-stories', true);

-- Create RLS policies for Instagram stories bucket
CREATE POLICY "Users can view Instagram stories" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'instagram-stories');

CREATE POLICY "Users can upload their own Instagram stories" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'instagram-stories' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own Instagram stories" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'instagram-stories' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own Instagram stories" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'instagram-stories' AND auth.uid()::text = (storage.foldername(name))[1]);