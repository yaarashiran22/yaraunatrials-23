-- Fix security warnings by setting proper search paths for the notification functions
CREATE OR REPLACE FUNCTION public.create_post_like_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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

-- Fix security warnings by setting proper search paths for the notification functions  
CREATE OR REPLACE FUNCTION public.create_post_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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