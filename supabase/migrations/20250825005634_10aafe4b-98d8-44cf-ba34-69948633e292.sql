-- Add storage policies for community images in the photos bucket
INSERT INTO storage.objects (bucket_id, name, owner, metadata) VALUES ('photos', 'community-images/', null, '{}') ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload community images
CREATE POLICY "Users can upload community images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = 'community-images');

-- Allow public access to view community images
CREATE POLICY "Community images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = 'community-images');

-- Allow authenticated users to update their community images  
CREATE POLICY "Users can update community images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = 'community-images');

-- Allow authenticated users to delete community images
CREATE POLICY "Users can delete community images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = 'community-images');