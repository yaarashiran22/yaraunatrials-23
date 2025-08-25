-- Create function to handle community join request notifications
CREATE OR REPLACE FUNCTION public.create_community_join_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  community_creator_id UUID;
  community_name TEXT;
  community_access_type TEXT;
  requester_name TEXT;
BEGIN
  -- Get community details
  SELECT creator_id, name, access_type INTO community_creator_id, community_name, community_access_type
  FROM public.communities
  WHERE id = NEW.community_id;
  
  -- Get requester name from profiles
  SELECT name INTO requester_name
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Only create notification for pending requests (not open communities)
  IF NEW.status = 'pending' AND community_access_type != 'open' THEN
    INSERT INTO public.notifications (
      user_id, 
      type, 
      title, 
      message, 
      related_user_id
    )
    VALUES (
      community_creator_id,
      'community_join_request',
      'בקשת הצטרפות לקהילה',
      COALESCE(requester_name, 'משתמש') || ' מבקש להצטרף לקהילה "' || community_name || '"',
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for community join notifications
CREATE TRIGGER trigger_community_join_notification
  AFTER INSERT ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION public.create_community_join_notification();

-- Create function to approve/reject community membership
CREATE OR REPLACE FUNCTION public.update_community_membership_status(
  membership_id UUID,
  new_status TEXT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  community_creator_id UUID;
  membership_community_id UUID;
BEGIN
  -- Get the community creator and community id for this membership
  SELECT c.creator_id, cm.community_id INTO community_creator_id, membership_community_id
  FROM public.community_members cm
  JOIN public.communities c ON c.id = cm.community_id
  WHERE cm.id = membership_id;
  
  -- Check if the current user is the community creator
  IF auth.uid() != community_creator_id THEN
    RETURN false;
  END IF;
  
  -- Update the membership status
  UPDATE public.community_members
  SET status = new_status
  WHERE id = membership_id;
  
  RETURN true;
END;
$$;