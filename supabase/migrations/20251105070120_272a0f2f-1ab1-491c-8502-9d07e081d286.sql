-- Add missing columns to community_perks table
ALTER TABLE public.community_perks 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS terms TEXT;

-- Add is_active column to communities table
ALTER TABLE public.communities 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create user_coupons table
CREATE TABLE IF NOT EXISTS public.user_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  business_name TEXT,
  discount_amount TEXT,
  image_url TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  neighborhood TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all active user coupons"
  ON public.user_coupons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create their own coupons"
  ON public.user_coupons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coupons"
  ON public.user_coupons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coupons"
  ON public.user_coupons FOR DELETE
  USING (auth.uid() = user_id);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- Create event_rsvps table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'going',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RSVPs are viewable by everyone"
  ON public.event_rsvps FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own RSVPs"
  ON public.event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RSVPs"
  ON public.event_rsvps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RSVPs"
  ON public.event_rsvps FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_picture_galleries table
CREATE TABLE IF NOT EXISTS public.user_picture_galleries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_picture_galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Picture galleries are viewable by everyone"
  ON public.user_picture_galleries FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own pictures"
  ON public.user_picture_galleries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pictures"
  ON public.user_picture_galleries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pictures"
  ON public.user_picture_galleries FOR DELETE
  USING (auth.uid() = user_id);

-- Create friends_picture_galleries table
CREATE TABLE IF NOT EXISTS public.friends_picture_galleries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.friends_picture_galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Friends pictures are viewable by everyone"
  ON public.friends_picture_galleries FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own friends pictures"
  ON public.friends_picture_galleries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friends pictures"
  ON public.friends_picture_galleries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own friends pictures"
  ON public.friends_picture_galleries FOR DELETE
  USING (auth.uid() = user_id);

-- Add missing columns to events table for new features
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS instagram_link TEXT,
ADD COLUMN IF NOT EXISTS age_range TEXT,
ADD COLUMN IF NOT EXISTS venue_type TEXT;