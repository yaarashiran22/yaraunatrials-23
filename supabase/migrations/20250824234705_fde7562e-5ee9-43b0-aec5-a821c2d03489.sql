-- Add columns to support text updates/announcements in stories table
ALTER TABLE public.stories 
ADD COLUMN story_type TEXT DEFAULT 'image' CHECK (story_type IN ('image', 'announcement')),
ADD COLUMN text_content TEXT,
ADD COLUMN is_announcement BOOLEAN DEFAULT false;

-- Update existing records to have proper type
UPDATE public.stories SET story_type = 'image', is_announcement = false WHERE story_type IS NULL;