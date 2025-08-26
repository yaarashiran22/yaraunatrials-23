-- Add mood column to events table for mood filtering functionality
ALTER TABLE public.events 
ADD COLUMN mood text;