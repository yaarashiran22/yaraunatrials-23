-- Create storage bucket for daily photo challenge images
INSERT INTO storage.buckets (id, name, public) VALUES ('daily-photos', 'daily-photos', true);

-- Create storage policies for daily photo uploads
CREATE POLICY "Daily photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'daily-photos');

CREATE POLICY "Users can upload their own daily photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'daily-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own daily photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'daily-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own daily photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'daily-photos' AND auth.uid()::text = (storage.foldername(name))[1]);