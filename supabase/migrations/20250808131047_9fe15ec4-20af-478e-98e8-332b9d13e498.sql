-- Create table for photo instructions
CREATE TABLE public.daily_photo_instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instruction_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for daily photo challenges (tracks which instruction is active each day)
CREATE TABLE public.daily_photo_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instruction_id UUID NOT NULL REFERENCES public.daily_photo_instructions(id),
  challenge_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user photo submissions
CREATE TABLE public.daily_photo_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.daily_photo_challenges(id),
  user_id UUID REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_photo_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_photo_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_photo_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_photo_instructions
CREATE POLICY "Anyone can view photo instructions" 
ON public.daily_photo_instructions 
FOR SELECT 
USING (true);

-- RLS Policies for daily_photo_challenges
CREATE POLICY "Anyone can view daily challenges" 
ON public.daily_photo_challenges 
FOR SELECT 
USING (true);

-- RLS Policies for daily_photo_submissions
CREATE POLICY "Anyone can view photo submissions" 
ON public.daily_photo_submissions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create photo submissions" 
ON public.daily_photo_submissions 
FOR INSERT 
WITH CHECK (true); -- Allow both authenticated and anonymous users

CREATE POLICY "Users can delete their own submissions" 
ON public.daily_photo_submissions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_daily_photo_instructions_updated_at
BEFORE UPDATE ON public.daily_photo_instructions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_photo_submissions_updated_at
BEFORE UPDATE ON public.daily_photo_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample photo instructions
INSERT INTO public.daily_photo_instructions (instruction_text) VALUES
('בדרך לעבודה'),
('הנוף מהחלון שלי'),
('הארוחה הכי טעימה היום'),
('הפינה הכי נעימה בבית'),
('משהו שגרם לי לחייך היום'),
('התחביב שלי'),
('החיית המחמד שלי'),
('הספר שאני קורא'),
('הפרח הכי יפה שראיתי'),
('השקיעה מהמקום שלי');

-- Create today's challenge with the first instruction
INSERT INTO public.daily_photo_challenges (instruction_id, challenge_date)
SELECT id, CURRENT_DATE
FROM public.daily_photo_instructions
LIMIT 1;

-- Create a function to rotate daily challenges
CREATE OR REPLACE FUNCTION public.rotate_daily_challenge()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  next_instruction_id UUID;
  last_instruction_id UUID;
BEGIN
  -- Get the last used instruction
  SELECT instruction_id INTO last_instruction_id
  FROM public.daily_photo_challenges
  ORDER BY challenge_date DESC
  LIMIT 1;
  
  -- Get the next instruction (rotate through available instructions)
  SELECT id INTO next_instruction_id
  FROM public.daily_photo_instructions
  WHERE id > last_instruction_id
  ORDER BY id ASC
  LIMIT 1;
  
  -- If no next instruction found, start from the beginning
  IF next_instruction_id IS NULL THEN
    SELECT id INTO next_instruction_id
    FROM public.daily_photo_instructions
    ORDER BY id ASC
    LIMIT 1;
  END IF;
  
  -- Insert today's challenge if it doesn't exist
  INSERT INTO public.daily_photo_challenges (instruction_id, challenge_date)
  VALUES (next_instruction_id, CURRENT_DATE)
  ON CONFLICT (challenge_date) DO NOTHING;
END;
$$;