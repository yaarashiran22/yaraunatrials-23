-- Create table for tracking user coupon claims
CREATE TABLE public.user_coupon_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  perk_id UUID NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  qr_code_data TEXT NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_coupon_claims ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own coupon claims" 
ON public.user_coupon_claims 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coupon claims" 
ON public.user_coupon_claims 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coupon claims" 
ON public.user_coupon_claims 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_coupon_claims_updated_at
BEFORE UPDATE ON public.user_coupon_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key reference to community_perks
ALTER TABLE public.user_coupon_claims 
ADD CONSTRAINT user_coupon_claims_perk_id_fkey 
FOREIGN KEY (perk_id) REFERENCES public.community_perks(id) ON DELETE CASCADE;