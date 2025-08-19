-- Create storage policies for friends feed uploads in profile-images bucket

-- Allow users to upload their own friends feed images
CREATE POLICY "Users can upload friends feed images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-images' 
  AND name LIKE 'friends-feed/%'
  AND auth.uid()::text IS NOT NULL
);

-- Allow users to view friends feed images (public read)
CREATE POLICY "Friends feed images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'profile-images' 
  AND name LIKE 'friends-feed/%'
);

-- Allow users to update their own friends feed images
CREATE POLICY "Users can update their own friends feed images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-images' 
  AND name LIKE 'friends-feed/%'
  AND auth.uid()::text IS NOT NULL
);

-- Allow users to delete their own friends feed images
CREATE POLICY "Users can delete their own friends feed images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-images' 
  AND name LIKE 'friends-feed/%'
  AND auth.uid()::text IS NOT NULL
);