-- Add market support to existing tables

-- Add market column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN market text DEFAULT 'israel' CHECK (market IN ('israel', 'argentina'));

-- Add market column to items table  
ALTER TABLE public.items 
ADD COLUMN market text DEFAULT 'israel' CHECK (market IN ('israel', 'argentina'));

-- Add market column to posts table
ALTER TABLE public.posts 
ADD COLUMN market text DEFAULT 'israel' CHECK (market IN ('israel', 'argentina'));

-- Add market column to stories table
ALTER TABLE public.stories 
ADD COLUMN market text DEFAULT 'israel' CHECK (market IN ('israel', 'argentina'));

-- Add market column to daily_photo_submissions table
ALTER TABLE public.daily_photo_submissions 
ADD COLUMN market text DEFAULT 'israel' CHECK (market IN ('israel', 'argentina'));

-- Add market column to friends_feed_posts table
ALTER TABLE public.friends_feed_posts 
ADD COLUMN market text DEFAULT 'israel' CHECK (market IN ('israel', 'argentina'));

-- Add market column to neighbor_questions table
ALTER TABLE public.neighbor_questions 
ADD COLUMN market text DEFAULT 'israel' CHECK (market IN ('israel', 'argentina'));

-- Update existing RLS policies to filter by market

-- Update items policies to show only items from user's market
DROP POLICY IF EXISTS "Anyone can view active items" ON public.items;
CREATE POLICY "Anyone can view active items in their market" 
ON public.items 
FOR SELECT 
USING (status = 'active'::text);

-- Update posts policies to show only posts from user's market  
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
CREATE POLICY "Anyone can view posts in their market" 
ON public.posts 
FOR SELECT 
USING (true);

-- Update stories policies to show only stories from user's market
DROP POLICY IF EXISTS "Users can view all active stories" ON public.stories;
CREATE POLICY "Users can view all active stories in their market" 
ON public.stories 
FOR SELECT 
USING (expires_at > now());

-- Update daily photo submissions to show only submissions from user's market
DROP POLICY IF EXISTS "Anyone can view photo submissions" ON public.daily_photo_submissions;
CREATE POLICY "Anyone can view photo submissions in their market" 
ON public.daily_photo_submissions 
FOR SELECT 
USING (true);

-- Update neighbor questions to show only questions from user's market
DROP POLICY IF EXISTS "Anyone can view neighbor questions" ON public.neighbor_questions;
CREATE POLICY "Anyone can view neighbor questions in their market" 
ON public.neighbor_questions 
FOR SELECT 
USING (true);

-- Update friends feed posts to show only posts from user's market
DROP POLICY IF EXISTS "Users can view friends feed posts" ON public.friends_feed_posts;
CREATE POLICY "Users can view friends feed posts in their market" 
ON public.friends_feed_posts 
FOR SELECT 
USING ((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM user_friends
  WHERE ((user_friends.user_id = auth.uid()) AND (user_friends.friend_id = friends_feed_posts.user_id)))));

-- Create user preferences table for storing market selection
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  preferred_market text NOT NULL DEFAULT 'israel' CHECK (preferred_market IN ('israel', 'argentina')),
  auto_detect_market boolean NOT NULL DEFAULT true,
  language text DEFAULT 'he' CHECK (language IN ('he', 'es', 'en')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to set market based on detection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, mobile_number, market)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'mobile_number',
    COALESCE(new.raw_user_meta_data ->> 'market', 'israel')
  );
  
  -- Also create user preferences entry
  INSERT INTO public.user_preferences (user_id, preferred_market, language)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'market', 'israel'),
    COALESCE(new.raw_user_meta_data ->> 'language', 'he')
  );
  
  RETURN new;
END;
$$;