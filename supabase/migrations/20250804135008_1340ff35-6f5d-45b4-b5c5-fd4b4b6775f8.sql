-- Create a table for neighbor questions
CREATE TABLE public.neighbor_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.neighbor_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for neighbor questions
CREATE POLICY "Anyone can view neighbor questions" 
ON public.neighbor_questions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create neighbor questions" 
ON public.neighbor_questions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own neighbor questions" 
ON public.neighbor_questions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own neighbor questions" 
ON public.neighbor_questions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_neighbor_questions_updated_at
BEFORE UPDATE ON public.neighbor_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();