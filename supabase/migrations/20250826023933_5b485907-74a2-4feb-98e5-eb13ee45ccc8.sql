-- Create table to track recommendation agreements
CREATE TABLE public.recommendation_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendation_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, recommendation_id)
);

-- Enable Row Level Security
ALTER TABLE public.recommendation_agreements ENABLE ROW LEVEL SECURITY;

-- Create policies for recommendation agreements
CREATE POLICY "Users can view all agreements" 
ON public.recommendation_agreements 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own agreements" 
ON public.recommendation_agreements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agreements" 
ON public.recommendation_agreements 
FOR DELETE 
USING (auth.uid() = user_id);