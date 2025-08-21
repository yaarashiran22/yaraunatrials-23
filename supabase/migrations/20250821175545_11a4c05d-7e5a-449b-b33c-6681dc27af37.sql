-- Add external_link column to events table
ALTER TABLE public.events 
ADD COLUMN external_link text;