-- Add status field to user_locations table to track "open to hang" status
ALTER TABLE public.user_locations 
ADD COLUMN status TEXT DEFAULT 'normal',
ADD COLUMN status_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance when filtering by status
CREATE INDEX idx_user_locations_status ON public.user_locations(status, status_expires_at);

-- Create function to automatically expire "open to hang" status after 2 hours
CREATE OR REPLACE FUNCTION public.expire_hanging_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.user_locations
  SET status = 'normal', status_expires_at = NULL
  WHERE status = 'open_to_hang' 
    AND status_expires_at IS NOT NULL 
    AND status_expires_at < now();
END;
$function$;