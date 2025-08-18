-- Create table for photo gallery likes
CREATE TABLE public.photo_gallery_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  gallery_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.photo_gallery_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for photo gallery likes
CREATE POLICY "Users can like photos" 
ON public.photo_gallery_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
ON public.photo_gallery_likes 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view photo likes" 
ON public.photo_gallery_likes 
FOR SELECT 
USING (true);

-- Create unique constraint to prevent duplicate likes
CREATE UNIQUE INDEX photo_gallery_likes_user_gallery_image_unique 
ON public.photo_gallery_likes (user_id, gallery_id, image_url);

-- Create index for better performance
CREATE INDEX idx_photo_gallery_likes_gallery_id ON public.photo_gallery_likes (gallery_id);
CREATE INDEX idx_photo_gallery_likes_image_url ON public.photo_gallery_likes (image_url);