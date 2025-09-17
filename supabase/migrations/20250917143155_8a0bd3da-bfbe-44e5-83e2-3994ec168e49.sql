-- Create storage buckets for the app
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profile-images', 'profile-images', true),
  ('stories', 'stories', true),
  ('daily-photos', 'daily-photos', true),
  ('photos', 'photos', true),
  ('item-images', 'item-images', true),
  ('videos', 'videos', true),
  ('profile-photos', 'profile-photos', true),
  ('instagram-stories', 'instagram-stories', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for public read access
CREATE POLICY "Anyone can view item images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'item-images');

CREATE POLICY "Users can upload their own item images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own item images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own item images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for profile images
CREATE POLICY "Anyone can view profile images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile image" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile image" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for photos
CREATE POLICY "Anyone can view photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos');

CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for videos
CREATE POLICY "Anyone can view videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload their own videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);