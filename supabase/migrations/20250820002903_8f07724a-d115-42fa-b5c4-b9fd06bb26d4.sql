-- Create item-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create RLS policies for item-images bucket
CREATE POLICY "Anyone can view item images"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-images');

CREATE POLICY "Users can upload their own item images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'item-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own item images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'item-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own item images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'item-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);