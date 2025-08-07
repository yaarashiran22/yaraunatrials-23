-- Add mobile_number field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN mobile_number text;

-- Update the handle_new_user function to include mobile_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, mobile_number)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'mobile_number'
  );
  RETURN new;
END;
$function$;