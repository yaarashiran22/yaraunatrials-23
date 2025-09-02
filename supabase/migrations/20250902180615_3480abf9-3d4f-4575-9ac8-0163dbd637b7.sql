-- Add unique constraint to user_locations.user_id to allow upsert operations
-- This ensures each user can only have one location record at a time
ALTER TABLE public.user_locations 
ADD CONSTRAINT user_locations_user_id_unique UNIQUE (user_id);