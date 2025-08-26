-- Update all market references to argentina
UPDATE public.profiles SET market = 'argentina' WHERE market = 'israel' OR market IS NULL;
UPDATE public.user_preferences SET preferred_market = 'argentina' WHERE preferred_market = 'israel';
UPDATE public.items SET market = 'argentina' WHERE market = 'israel' OR market IS NULL;
UPDATE public.events SET market = 'argentina' WHERE market = 'israel' OR market IS NULL;
UPDATE public.posts SET market = 'argentina' WHERE market = 'israel' OR market IS NULL;
UPDATE public.stories SET market = 'argentina' WHERE market = 'israel' OR market IS NULL;
UPDATE public.communities SET market = 'argentina' WHERE market = 'israel' OR market IS NULL;
UPDATE public.neighbor_questions SET market = 'argentina' WHERE market = 'israel' OR market IS NULL;
UPDATE public.friends_feed_posts SET market = 'argentina' WHERE market = 'israel' OR market IS NULL;
UPDATE public.neighborhood_ideas SET market = 'argentina' WHERE market = 'israel' OR market IS NULL;

-- Update default values for market columns
ALTER TABLE public.profiles ALTER COLUMN market SET DEFAULT 'argentina';
ALTER TABLE public.user_preferences ALTER COLUMN preferred_market SET DEFAULT 'argentina';
ALTER TABLE public.items ALTER COLUMN market SET DEFAULT 'argentina';
ALTER TABLE public.events ALTER COLUMN market SET DEFAULT 'argentina';
ALTER TABLE public.posts ALTER COLUMN market SET DEFAULT 'argentina';
ALTER TABLE public.stories ALTER COLUMN market SET DEFAULT 'argentina';
ALTER TABLE public.communities ALTER COLUMN market SET DEFAULT 'argentina';
ALTER TABLE public.neighbor_questions ALTER COLUMN market SET DEFAULT 'argentina';
ALTER TABLE public.friends_feed_posts ALTER COLUMN market SET DEFAULT 'argentina';
ALTER TABLE public.neighborhood_ideas ALTER COLUMN market SET DEFAULT 'argentina';

-- Update the handle_new_user function to use argentina as default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, mobile_number, market, account_type)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'mobile_number',
    COALESCE(new.raw_user_meta_data ->> 'market', 'argentina'),
    COALESCE(new.raw_user_meta_data ->> 'account_type', 'personal')
  );
  
  -- Also create user preferences entry
  INSERT INTO public.user_preferences (user_id, preferred_market, language)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'market', 'argentina'),
    COALESCE(new.raw_user_meta_data ->> 'language', 'es')
  );
  
  RETURN new;
END;
$function$;