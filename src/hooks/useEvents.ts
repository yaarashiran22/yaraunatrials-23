import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

const fetchEvents = async (eventType?: 'event' | 'meetup'): Promise<Event[]> => {
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

export const useEvents = (eventType?: 'event' | 'meetup') => {
  const queryResult = useQuery({
    queryKey: ['events', eventType],
    queryFn: () => fetchEvents(eventType),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    events: queryResult.data || [],
    loading: queryResult.isLoading,
    refetch: queryResult.refetch,
  };
};