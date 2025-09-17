-- Create a function to automatically make the first user an admin
CREATE OR REPLACE FUNCTION public.setup_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Check if there are any existing admins
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
  -- If no admins exist, make this user an admin
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run when a new profile is created
CREATE TRIGGER setup_first_admin_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.setup_first_admin();