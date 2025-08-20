-- Add video_url column to posts table to support video uploads
ALTER TABLE public.posts 
ADD COLUMN video_url text;

-- Add a comment to document the video_url column
COMMENT ON COLUMN public.posts.video_url IS 'URL for uploaded video content';