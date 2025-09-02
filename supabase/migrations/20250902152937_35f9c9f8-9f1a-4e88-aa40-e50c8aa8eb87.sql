-- Add new notification function for meetup join requests
CREATE OR REPLACE FUNCTION public.create_meetup_join_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  event_creator_id UUID;
  event_title TEXT;
  requester_name TEXT;
  event_type TEXT;
BEGIN
  -- Get the event creator, title, and type
  SELECT user_id, title, event_type INTO event_creator_id, event_title, event_type
  FROM public.events
  WHERE id = NEW.event_id;
  
  -- Get requester name from profiles
  SELECT name INTO requester_name
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Only create notification for meetup join requests that are pending
  IF NEW.status = 'pending' AND event_type = 'meetup' THEN
    INSERT INTO public.notifications (
      user_id, 
      type, 
      title, 
      message, 
      related_user_id
    )
    VALUES (
      event_creator_id,
      'meetup_join_request',
      'New Meetup Join Request',
      COALESCE(requester_name, 'Someone') || ' wants to join your meetup "' || event_title || '"',
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for meetup join notifications
DROP TRIGGER IF EXISTS meetup_join_notification_trigger ON public.event_rsvps;
CREATE TRIGGER meetup_join_notification_trigger
  AFTER INSERT ON public.event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.create_meetup_join_notification();

-- Update event_rsvps table to support pending status (modify default)
ALTER TABLE public.event_rsvps ALTER COLUMN status SET DEFAULT 'pending';

-- Add function to handle meetup join request responses
CREATE OR REPLACE FUNCTION public.update_meetup_join_status(rsvp_id uuid, new_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  event_creator_id UUID;
  rsvp_event_id UUID;
BEGIN
  -- Get the event creator and event id for this RSVP
  SELECT e.user_id, er.event_id INTO event_creator_id, rsvp_event_id
  FROM public.event_rsvps er
  JOIN public.events e ON e.id = er.event_id
  WHERE er.id = rsvp_id;
  
  -- Check if the current user is the event creator
  IF auth.uid() != event_creator_id THEN
    RETURN false;
  END IF;
  
  -- Update the RSVP status
  UPDATE public.event_rsvps
  SET status = new_status, updated_at = now()
  WHERE id = rsvp_id;
  
  RETURN true;
END;
$function$;