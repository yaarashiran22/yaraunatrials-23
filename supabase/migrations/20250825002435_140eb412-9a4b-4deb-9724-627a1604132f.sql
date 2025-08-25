-- Add event_type column to differentiate between meetups and events
ALTER TABLE public.events 
ADD COLUMN event_type text NOT NULL DEFAULT 'event';

-- Add a check constraint to ensure valid event types
ALTER TABLE public.events 
ADD CONSTRAINT valid_event_type 
CHECK (event_type IN ('event', 'meetup'));

-- Update existing records to be events by default
UPDATE public.events 
SET event_type = 'event' 
WHERE event_type IS NULL;