-- Drop and recreate smallprofiles table with proper structure
DROP TABLE IF EXISTS public.smallprofiles;

CREATE TABLE public.smallprofiles (
  id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS for smallprofiles
ALTER TABLE public.smallprofiles ENABLE ROW LEVEL SECURITY;

-- Create policies for smallprofiles
CREATE POLICY "Anyone can view small profile photos" 
ON public.smallprofiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own small profile photo" 
ON public.smallprofiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own small profile photo" 
ON public.smallprofiles 
FOR UPDATE 
USING (auth.uid() = id);