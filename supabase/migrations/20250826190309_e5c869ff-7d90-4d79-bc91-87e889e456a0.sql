-- Remove unused tables and their associated policies to improve performance

-- Drop unused daily photo system tables
DROP TABLE IF EXISTS public.daily_photo_submissions CASCADE;
DROP TABLE IF EXISTS public.daily_photo_challenges CASCADE; 
DROP TABLE IF EXISTS public.daily_photo_instructions CASCADE;

-- Drop unused favorites table (since app uses localStorage)
DROP TABLE IF EXISTS public.favorites CASCADE;

-- Drop unused saved_items table
DROP TABLE IF EXISTS public.saved_items CASCADE;

-- Drop unused community_posts table
DROP TABLE IF EXISTS public.community_posts CASCADE;