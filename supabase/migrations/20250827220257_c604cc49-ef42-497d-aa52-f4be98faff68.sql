-- Fix RLS policies for user_coupon_claims to require authentication
DROP POLICY IF EXISTS "Users can view their own coupon claims" ON public.user_coupon_claims;
DROP POLICY IF EXISTS "Users can create their own coupon claims" ON public.user_coupon_claims;
DROP POLICY IF EXISTS "Users can update their own coupon claims" ON public.user_coupon_claims;

-- Create proper authenticated-only policies
CREATE POLICY "Authenticated users can view their own coupon claims" 
ON public.user_coupon_claims 
FOR SELECT 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create their own coupon claims" 
ON public.user_coupon_claims 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update their own coupon claims" 
ON public.user_coupon_claims 
FOR UPDATE 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);