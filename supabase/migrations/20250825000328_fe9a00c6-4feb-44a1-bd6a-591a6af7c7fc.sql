-- Create communities table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('interests', 'causes', 'identity')),
  subcategory TEXT, -- skating, salsa, yoga, etc.
  access_type TEXT NOT NULL DEFAULT 'closed' CHECK (access_type IN ('open', 'closed', 'invite_only')),
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  market TEXT DEFAULT 'israel',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community members table
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Create community events table (private events for community members)
CREATE TABLE public.community_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  time TIME,
  location TEXT,
  image_url TEXT,
  max_attendees INTEGER,
  is_members_only BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community perks/coupons table
CREATE TABLE public.community_perks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_amount TEXT, -- "10%", "Free entry", etc.
  terms TEXT,
  image_url TEXT,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community posts table (lightweight discussions)
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  post_type TEXT DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'poll', 'announcement', 'meetup')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities
CREATE POLICY "Anyone can view active communities" ON public.communities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators and admins can update their communities" ON public.communities
  FOR UPDATE USING (
    creator_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = communities.id 
      AND user_id = auth.uid() 
      AND role = 'admin' 
      AND status = 'approved'
    )
  );

-- RLS Policies for community members
CREATE POLICY "Anyone can view approved members" ON public.community_members
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can request to join communities" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own membership requests" ON public.community_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Creators and admins can manage memberships" ON public.community_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_members.community_id
      AND (c.creator_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM public.community_members cm
             WHERE cm.community_id = c.id 
             AND cm.user_id = auth.uid() 
             AND cm.role = 'admin' 
             AND cm.status = 'approved'
           ))
    )
  );

-- RLS Policies for community events  
CREATE POLICY "Community members can view events" ON public.community_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = community_events.community_id 
      AND user_id = auth.uid() 
      AND status = 'approved'
    )
  );

CREATE POLICY "Community members can create events" ON public.community_events
  FOR INSERT WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = community_events.community_id 
      AND user_id = auth.uid() 
      AND status = 'approved'
    )
  );

-- RLS Policies for community perks
CREATE POLICY "Community members can view perks" ON public.community_perks
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = community_perks.community_id 
      AND user_id = auth.uid() 
      AND status = 'approved'
    )
  );

-- RLS Policies for community posts
CREATE POLICY "Community members can view posts" ON public.community_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = community_posts.community_id 
      AND user_id = auth.uid() 
      AND status = 'approved'
    )
  );

CREATE POLICY "Community members can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = community_posts.community_id 
      AND user_id = auth.uid() 
      AND status = 'approved'
    )
  );

-- Functions to update community member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE public.communities 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    UPDATE public.communities 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE public.communities 
    SET member_count = member_count - 1 
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE public.communities 
    SET member_count = member_count - 1 
    WHERE id = OLD.community_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating member count
CREATE TRIGGER update_community_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- Trigger for updating timestamps
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_events_updated_at
  BEFORE UPDATE ON public.community_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();