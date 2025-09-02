import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OptimizedEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
  category: 'event' | 'meetup';
  user_id: string;
  profile?: {
    id: string;
    name: string;
    profile_image_url?: string;
  };
}

export const useOptimizedEvents = () => {
  return useQuery({
    queryKey: ['optimized-events-meetups'],
    queryFn: async (): Promise<OptimizedEvent[]> => {
      console.log('Fetching optimized events and meetups...');
      
      // Fetch events and meetups in parallel with minimal data
      const [eventsResult, meetupsResult] = await Promise.all([
        supabase
          .from('events')
          .select('id, title, description, location, date, time, user_id')
          .order('date', { ascending: true })
          .limit(50), // Limit for performance
        
        supabase
          .from('events')
          .select('id, title, description, location, date, time, user_id')
          .eq('event_type', 'meetup')
          .order('date', { ascending: true })
          .limit(50) // Limit for performance
      ]);

      if (eventsResult.error) throw eventsResult.error;
      if (meetupsResult.error) throw meetupsResult.error;

      const events = eventsResult.data || [];
      const meetups = meetupsResult.data || [];

      // Combine and mark categories
      const allItems = [
        ...events.map(event => ({ ...event, category: 'event' as const })),
        ...meetups.map(meetup => ({ ...meetup, category: 'meetup' as const }))
      ];

      // Get unique user IDs for batch profile fetch
      const userIds = [...new Set(allItems.map(item => item.user_id))];
      
      if (userIds.length === 0) return allItems;

      // Batch fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, profile_image_url')
        .in('id', userIds);

      // Combine items with profiles
      return allItems.map(item => ({
        ...item,
        profile: profiles?.find(p => p.id === item.user_id)
      }));
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};