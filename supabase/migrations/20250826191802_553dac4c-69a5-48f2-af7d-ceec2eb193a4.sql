-- Add INSERT policy for videos bucket to allow users to upload their own videos
CREATE POLICY "Users can upload their own videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);