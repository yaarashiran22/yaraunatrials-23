-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  bio TEXT,
  profile_image_url TEXT,
  location TEXT,
  interests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create items table  
CREATE TABLE IF NOT EXISTS public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  image_url TEXT,
  category TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items are viewable by everyone" ON public.items FOR SELECT USING (true);
CREATE POLICY "Users can create their own items" ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own items" ON public.items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own items" ON public.items FOR DELETE USING (auth.uid() = user_id);

-- Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  creator_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Communities are viewable by everyone" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Users can create communities" ON public.communities FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their communities" ON public.communities FOR UPDATE USING (auth.uid() = creator_id);

-- Create community_perks table
CREATE TABLE IF NOT EXISTS public.community_perks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  discount_amount TEXT,
  description TEXT,
  image_url TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_perks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community perks are viewable by everyone" ON public.community_perks FOR SELECT USING (true);

-- Create coupon_claims table
CREATE TABLE IF NOT EXISTS public.coupon_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  perk_id UUID REFERENCES public.community_perks(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  qr_code_data TEXT,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coupon_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coupon claims" ON public.coupon_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create coupon claims" ON public.coupon_claims FOR INSERT WITH CHECK (auth.uid() = user_id);