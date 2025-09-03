-- Add mood column to user_locations table for mood-based filtering
ALTER TABLE public.user_locations 
ADD COLUMN mood text;

-- Add index for better performance when filtering by mood
CREATE INDEX idx_user_locations_mood ON public.user_locations(mood);

-- Add index for filtering by status and mood together
CREATE INDEX idx_user_locations_status_mood ON public.user_locations(status, mood);