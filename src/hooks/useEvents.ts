import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  price?: string;
  image_url?: string;
  video_url?: string;
  market: string;
  event_type: 'event' | 'meetup';
  created_at: string;
  updated_at: string;
  uploader?: {
    name: string;
    image: string;
    small_photo: string;
    location: string;
  };
}

const fetchEvents = async (eventType?: 'event' | 'meetup', followingOnly?: boolean, userId?: string): Promise<Event[]> => {
  let query = supabase
    .from('events')
    .select(`
      id,
      user_id,
      title,
      description,
      date,
      time,
      location,
      price,
      image_url,
      video_url,
      market,
      event_type,
      created_at,
      updated_at
    `)
    .eq('market', 'argentina')
    .order('created_at', { ascending: false });

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  if (followingOnly && userId) {
    // Get users the current user is following
    const { data: followingData, error: followingError } = await supabase
      .from('user_following')
      .select('following_id')
      .eq('follower_id', userId);

    if (followingError) throw followingError;

    const followingIds = followingData?.map(f => f.following_id) || [];
    
    // Filter events to only include those created by users they are following
    // Also get events with RSVPs from people they follow
    if (followingIds.length > 0) {
      // For now, just filter by event creator. We can add RSVP filtering later
      query = query.in('user_id', followingIds);
    } else {
      // If user is not following anyone, return empty array
      return [];
    }
  }

  const { data: events, error: eventsError } = await query;

  if (eventsError) throw eventsError;

  if (!events || events.length === 0) {
    return [];
  }

  // Fetch uploader profiles
  const userIds = events.map(event => event.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, profile_image_url')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  const profilesMap = (profiles || []).reduce((acc: any, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {});

  return events.map(event => ({
    ...event,
    event_type: event.event_type as 'event' | 'meetup',
    uploader: {
      name: profilesMap[event.user_id]?.name || 'משתמש',
      image: profilesMap[event.user_id]?.profile_image_url || '/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png',
      small_photo: profilesMap[event.user_id]?.profile_image_url || '/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png',
      location: profilesMap[event.user_id]?.location || 'לא צוין'
    }
  }));
};

export const useEvents = (eventType?: 'event' | 'meetup', followingOnly?: boolean) => {
  const { user } = useAuth();
  
  const queryResult = useQuery({
    queryKey: ['events', eventType, followingOnly, user?.id],
    queryFn: () => fetchEvents(eventType, followingOnly, user?.id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !followingOnly || !!user?.id, // Only fetch following events if user is logged in
  });

  return {
    events: queryResult.data || [],
    loading: queryResult.isLoading,
    refetch: queryResult.refetch,
  };
};