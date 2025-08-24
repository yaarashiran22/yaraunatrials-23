-- Add video_url column to items table for join me recommendations
ALTER TABLE items ADD COLUMN video_url text;

-- Add video_url column to events table
ALTER TABLE events ADD COLUMN video_url text;