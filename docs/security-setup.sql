-- ============================================================================
-- CRITICAL SECURITY SETUP FOR SUPABASE
-- ============================================================================
-- This file contains the SQL commands needed to implement Row Level Security (RLS)
-- and other security measures for the application.
-- 
-- IMPORTANT: These commands should be run in the Supabase SQL editor
-- or through database migrations after connecting the Supabase integration.
-- ============================================================================

-- Step 1: Enable Row Level Security on all tables
-- ============================================================================

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Step 2: Create comprehensive RLS policies
-- ============================================================================

-- PROFILES TABLE POLICIES
-- Users can read their own profile and non-private profiles
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;
CREATE POLICY "Users can read profiles" ON profiles FOR SELECT
USING (
  auth.uid() = id 
  OR (is_private = false OR is_private IS NULL)
  OR (auth.uid() IS NOT NULL AND show_in_search = true)
);

-- Users can only update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE
USING (auth.uid() = id);

-- ITEMS TABLE POLICIES
-- Users can read active items
DROP POLICY IF EXISTS "Users can read active items" ON items;
CREATE POLICY "Users can read active items" ON items FOR SELECT
USING (status = 'active' OR status IS NULL);

-- Users can only create items for themselves
DROP POLICY IF EXISTS "Users can insert own items" ON items;
CREATE POLICY "Users can insert own items" ON items FOR INSERT
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Users can only update their own items
DROP POLICY IF EXISTS "Users can update own items" ON items;
CREATE POLICY "Users can update own items" ON items FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own items
DROP POLICY IF EXISTS "Users can delete own items" ON items;
CREATE POLICY "Users can delete own items" ON items FOR DELETE
USING (auth.uid() = user_id);

-- POSTS TABLE POLICIES
-- Users can read all posts (public feed)
DROP POLICY IF EXISTS "Users can read posts" ON posts;
CREATE POLICY "Users can read posts" ON posts FOR SELECT
USING (true);

-- Users can only create posts for themselves
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Users can only update their own posts
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own posts
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE
USING (auth.uid() = user_id);

-- SAVED ITEMS TABLE POLICIES
-- Users can only see their own saved items
DROP POLICY IF EXISTS "Users can read own saved items" ON saved_items;
CREATE POLICY "Users can read own saved items" ON saved_items FOR SELECT
USING (auth.uid() = user_id);

-- Users can only save items for themselves
DROP POLICY IF EXISTS "Users can insert own saved items" ON saved_items;
CREATE POLICY "Users can insert own saved items" ON saved_items FOR INSERT
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Users can only delete their own saved items
DROP POLICY IF EXISTS "Users can delete own saved items" ON saved_items;
CREATE POLICY "Users can delete own saved items" ON saved_items FOR DELETE
USING (auth.uid() = user_id);

-- STORIES TABLE POLICIES
-- Users can read non-expired stories
DROP POLICY IF EXISTS "Users can read active stories" ON stories;
CREATE POLICY "Users can read active stories" ON stories FOR SELECT
USING (expires_at > now() OR expires_at IS NULL);

-- Users can only create stories for themselves
DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
CREATE POLICY "Users can insert own stories" ON stories FOR INSERT
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Users can only delete their own stories
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE
USING (auth.uid() = user_id);

-- Step 3: Create auto-profile creation trigger
-- ============================================================================

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, created_at)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'משתמש חדש'),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 4: Add security constraints
-- ============================================================================

-- Add check constraints for data validation
ALTER TABLE items 
ADD CONSTRAINT check_price_positive 
CHECK (price IS NULL OR price >= 0);

ALTER TABLE items 
ADD CONSTRAINT check_title_length 
CHECK (char_length(title) <= 100 AND char_length(title) > 0);

ALTER TABLE items 
ADD CONSTRAINT check_description_length 
CHECK (description IS NULL OR char_length(description) <= 500);

ALTER TABLE posts 
ADD CONSTRAINT check_content_length 
CHECK (char_length(content) <= 280 AND char_length(content) > 0);

ALTER TABLE profiles 
ADD CONSTRAINT check_name_length 
CHECK (name IS NULL OR char_length(name) <= 50);

ALTER TABLE profiles 
ADD CONSTRAINT check_bio_length 
CHECK (bio IS NULL OR char_length(bio) <= 200);

-- Step 5: Create indexes for performance and security
-- ============================================================================

-- Indexes for efficient querying with RLS
CREATE INDEX IF NOT EXISTS idx_items_user_id_status ON items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id_expires ON stories(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_show_in_search ON profiles(show_in_search) WHERE show_in_search = true;

-- Step 6: Set up storage bucket policies (for Supabase Storage)
-- ============================================================================

-- These policies should be set up in the Supabase dashboard for the storage buckets:

/*
For 'stories' bucket:
- Allow authenticated users to upload: 
  bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]
  
- Allow public read access:
  bucket_id = 'stories'

For 'profile-images' bucket:
- Allow authenticated users to upload their own images:
  bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
  
- Allow public read access:
  bucket_id = 'profile-images'

For 'item-images' bucket:
- Allow authenticated users to upload:
  bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]
  
- Allow public read access:
  bucket_id = 'item-images'
*/

-- Step 7: Create security monitoring functions
-- ============================================================================

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  event_type text,
  user_id uuid,
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  -- This would insert into a security_logs table if it exists
  -- For now, we'll just use the built-in logging
  RAISE LOG 'Security Event: % for user % with details %', event_type, user_id, details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify that RLS is properly enabled:

-- Check that RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('items', 'posts', 'profiles', 'saved_items', 'stories')
  AND schemaname = 'public';

-- Check that policies exist
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename IN ('items', 'posts', 'profiles', 'saved_items', 'stories')
ORDER BY tablename, cmd;

-- ============================================================================
-- ADDITIONAL SECURITY RECOMMENDATIONS
-- ============================================================================

/*
1. Enable email confirmation in Supabase Auth settings
2. Set up rate limiting in Supabase dashboard
3. Configure SMTP for secure email delivery
4. Set up monitoring and alerting for suspicious activities
5. Regularly audit user permissions and access patterns
6. Implement content moderation for user-generated content
7. Set up backup and recovery procedures
8. Use environment variables for sensitive configuration
9. Implement proper error handling without information leakage
10. Regular security audits and penetration testing
*/