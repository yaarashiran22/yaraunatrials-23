-- Add table for tracking users looking for companions at events
CREATE TABLE public.event_companion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one request per user per event
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.event_companion_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view all companion requests" 
ON public.event_companion_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own companion requests" 
ON public.event_companion_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companion requests" 
ON public.event_companion_requests 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_event_companion_requests_updated_at
  BEFORE UPDATE ON public.event_companion_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();