-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('item-images', 'item-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Create policies for item images bucket
CREATE POLICY "Anyone can view item images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'item-images');

CREATE POLICY "Users can upload their own item images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'item-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own item images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'item-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own item images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'item-images' AND auth.uid() IS NOT NULL);