-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

-- Create profile_photos table to track user photos
CREATE TABLE public.profile_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  display_order INTEGER NOT NULL CHECK (display_order >= 1 AND display_order <= 3),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, display_order)
);

-- Enable Row Level Security
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for profile photos
CREATE POLICY "Users can view their own profile photos" 
ON public.profile_photos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile photos" 
ON public.profile_photos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND display_order BETWEEN 1 AND 3);

CREATE POLICY "Users can update their own profile photos" 
ON public.profile_photos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile photos" 
ON public.profile_photos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage policies for profile photos
CREATE POLICY "Users can view their own profile photos in storage" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own profile photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile photos in storage" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile photos in storage" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_profile_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profile_photos_updated_at
BEFORE UPDATE ON public.profile_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_photos_updated_at();