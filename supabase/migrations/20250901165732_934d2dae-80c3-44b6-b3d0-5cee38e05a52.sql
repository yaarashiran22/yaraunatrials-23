-- Add open_to_connecting field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN open_to_connecting boolean DEFAULT false;