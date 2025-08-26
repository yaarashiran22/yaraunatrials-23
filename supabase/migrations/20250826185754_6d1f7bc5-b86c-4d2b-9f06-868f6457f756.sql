-- Create storage policies for video and image uploads in event creation

-- Policy for uploading to videos bucket
CREATE POLICY "Users can upload their own videos to videos bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for viewing videos in videos bucket  
CREATE POLICY "Anyone can view videos in videos bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

-- Policy for updating videos in videos bucket
CREATE POLICY "Users can update their own videos in videos bucket"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for deleting videos in videos bucket
CREATE POLICY "Users can delete their own videos in videos bucket"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for uploading to item-images bucket
CREATE POLICY "Users can upload their own images to item-images bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'item-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for viewing images in item-images bucket
CREATE POLICY "Anyone can view images in item-images bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'item-images');

-- Policy for updating images in item-images bucket
CREATE POLICY "Users can update their own images in item-images bucket"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'item-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for deleting images in item-images bucket
CREATE POLICY "Users can delete their own images in item-images bucket"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'item-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);