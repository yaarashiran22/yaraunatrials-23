-- Add foreign key constraints to user_friends table
ALTER TABLE public.user_friends 
ADD CONSTRAINT user_friends_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_friends 
ADD CONSTRAINT user_friends_friend_id_fkey 
FOREIGN KEY (friend_id) REFERENCES public.profiles(id) ON DELETE CASCADE;