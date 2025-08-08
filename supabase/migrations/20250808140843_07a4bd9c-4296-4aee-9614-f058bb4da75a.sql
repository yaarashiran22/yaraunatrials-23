-- Create table for permanent user picture galleries in the daily photo section
CREATE TABLE public.user_picture_galleries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_picture_galleries ENABLE ROW LEVEL SECURITY;

-- Create policies for user picture galleries
CREATE POLICY "Anyone can view user picture galleries" 
ON public.user_picture_galleries 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own picture galleries" 
ON public.user_picture_galleries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own picture galleries" 
ON public.user_picture_galleries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own picture galleries" 
ON public.user_picture_galleries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_picture_galleries_updated_at
BEFORE UPDATE ON public.user_picture_galleries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();