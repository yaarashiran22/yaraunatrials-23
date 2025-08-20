-- Add account_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN account_type text CHECK (account_type IN ('business', 'personal'));

-- Update the existing user profile creation function to handle account_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, mobile_number, market, account_type)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'mobile_number',
    COALESCE(new.raw_user_meta_data ->> 'market', 'israel'),
    COALESCE(new.raw_user_meta_data ->> 'account_type', 'personal')
  );
  
  -- Also create user preferences entry
  INSERT INTO public.user_preferences (user_id, preferred_market, language)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'market', 'israel'),
    COALESCE(new.raw_user_meta_data ->> 'language', 'he')
  );
  
  RETURN new;
END;
$function$;