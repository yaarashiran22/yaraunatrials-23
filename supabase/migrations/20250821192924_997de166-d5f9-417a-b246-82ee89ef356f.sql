-- Create trigger function for post like notifications
CREATE OR REPLACE FUNCTION public.create_post_like_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  post_owner_id UUID;
BEGIN
  -- Get the post owner ID
  SELECT user_id INTO post_owner_id
  FROM public.posts
  WHERE id = NEW.post_id;
  
  -- Only send notification if someone else liked the post (not the owner)
  IF NEW.user_id != post_owner_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_user_id)
    VALUES (
      post_owner_id,
      'post_like',
      'לייק חדש!',
      'מישהו אהב את הפוסט שלך',
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger function for post comment notifications  
CREATE OR REPLACE FUNCTION public.create_post_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  post_owner_id UUID;
BEGIN
  -- Get the post owner ID
  SELECT user_id INTO post_owner_id
  FROM public.posts
  WHERE id = NEW.post_id;
  
  -- Only send notification if someone else commented (not the owner)
  IF NEW.user_id != post_owner_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_user_id)
    VALUES (
      post_owner_id,
      'post_comment',
      'תגובה חדשה!',
      'מישהו הגיב על הפוסט שלך',
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for post likes
CREATE TRIGGER post_like_notification_trigger
  AFTER INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_post_like_notification();

-- Create trigger for post comments  
CREATE TRIGGER post_comment_notification_trigger
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_post_comment_notification();