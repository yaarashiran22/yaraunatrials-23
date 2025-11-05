-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  time TEXT,
  location TEXT,
  price TEXT,
  image_url TEXT,
  video_url TEXT,
  external_link TEXT,
  event_type TEXT DEFAULT 'event',
  mood TEXT,
  market TEXT DEFAULT 'argentina',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  target_audience TEXT,
  music_type TEXT,
  venue_size TEXT,
  price_range TEXT,
  venue_name TEXT,
  address TEXT,
  ticket_link TEXT
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own events" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
ON public.events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_events_updated_at();

-- Create index for better performance
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_events_location ON public.events(location);
CREATE INDEX idx_events_created_at ON public.events(created_at DESC);