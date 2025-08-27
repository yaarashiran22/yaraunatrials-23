-- Create table for user-generated coupons
CREATE TABLE public.user_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  valid_until DATE,
  neighborhood TEXT,
  business_name TEXT,
  discount_amount TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Anyone can view active user coupons" 
ON public.user_coupons 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create their own coupons" 
ON public.user_coupons 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own coupons" 
ON public.user_coupons 
FOR UPDATE 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own coupons" 
ON public.user_coupons 
FOR DELETE 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_coupons_updated_at
BEFORE UPDATE ON public.user_coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();