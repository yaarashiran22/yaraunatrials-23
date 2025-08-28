-- Check if user_following table exists and create following functionality

-- The user_following table already exists with columns:
-- id (uuid, primary key)
-- follower_id (uuid, not null) - the user who is following
-- following_id (uuid, not null) - the user being followed
-- created_at (timestamp with time zone, not null)

-- Let's ensure RLS policies are correct
-- Users can follow others
-- CREATE POLICY "Users can follow others" ON public.user_following FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow others  
-- CREATE POLICY "Users can unfollow others" ON public.user_following FOR DELETE USING (auth.uid() = follower_id);

-- Users can view their own following relationships
-- CREATE POLICY "Users can view their own following relationships" ON public.user_following FOR SELECT USING (auth.uid() = follower_id);

-- These policies already exist, so no changes needed to the database