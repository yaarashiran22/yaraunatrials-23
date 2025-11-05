-- Fix the function search path warning by recreating the function with proper search_path
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
DROP FUNCTION IF EXISTS public.update_events_updated_at();

CREATE OR REPLACE FUNCTION public.update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_events_updated_at();