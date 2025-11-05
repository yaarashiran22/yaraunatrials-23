-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add username column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Add missing columns to communities
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'open';
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

-- Create community_members table
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'pending',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (community_id, user_id)
);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_members
CREATE POLICY "Community members are viewable by everyone"
  ON public.community_members FOR SELECT
  USING (true);

CREATE POLICY "Users can create membership requests"
  ON public.community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships"
  ON public.community_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Community creators can update memberships"
  ON public.community_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE communities.id = community_members.community_id
      AND communities.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own memberships"
  ON public.community_members FOR DELETE
  USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_user_id UUID,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Create function to update community membership status
CREATE OR REPLACE FUNCTION public.update_community_membership_status(
  membership_id UUID,
  new_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_community_id UUID;
  v_creator_id UUID;
BEGIN
  -- Get the community_id from the membership
  SELECT community_id INTO v_community_id
  FROM community_members
  WHERE id = membership_id;
  
  -- Get the creator of the community
  SELECT creator_id INTO v_creator_id
  FROM communities
  WHERE id = v_community_id;
  
  -- Check if the current user is the creator
  IF v_creator_id = auth.uid() THEN
    UPDATE community_members
    SET status = new_status
    WHERE id = membership_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;