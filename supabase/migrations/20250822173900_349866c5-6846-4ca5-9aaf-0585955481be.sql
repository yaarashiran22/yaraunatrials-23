-- Fix search_path security issue by dropping trigger first, then function, then recreating both
DROP TRIGGER update_user_locations_updated_at ON public.user_locations;
DROP FUNCTION IF EXISTS public.update_user_locations_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_user_locations_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_user_locations_updated_at
BEFORE UPDATE ON public.user_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_user_locations_updated_at_column();