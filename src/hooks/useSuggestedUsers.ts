import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SuggestedUser {
  id: string;
  name: string;
  profile_image_url?: string;
  sharedEvents: string[];
  sharedEventCount: number;
  open_to_connecting: boolean;
}

export const useSuggestedUsers = () => {
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const { user } = useAuth();

  const findSuggestedUsers = async () => {
    if (!user?.id) {
      console.log('No user logged in');
      return;
    }

    setLoading(true);
    setSuggestedUsers([]);

    try {
      // Step 1: Get current user's event RSVPs
      const { data: userRSVPs, error: rsvpError } = await supabase
        .from('event_rsvps')
        .select(`
          event_id,
          events!inner(
            id,
            title,
            event_type
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'going');

      if (rsvpError) {
        console.error('Error fetching user RSVPs:', rsvpError);
        setLoading(false);
        return;
      }

      const userEventIds = userRSVPs?.map(rsvp => rsvp.event_id) || [];
      
      if (userEventIds.length === 0) {
        console.log('User has no event RSVPs');
        setLoading(false);
        return;
      }

      console.log('User RSVPs for events:', userEventIds);

      // Step 2: Find other users who RSVP'd for the same events
      const { data: otherRSVPs, error: matchError } = await supabase
        .from('event_rsvps')
        .select(`
          user_id,
          event_id,
          events!inner(
            id,
            title,
            event_type
          )
        `)
        .in('event_id', userEventIds)
        .eq('status', 'going')
        .neq('user_id', user.id);

      if (matchError) {
        console.error('Error fetching matching RSVPs:', matchError);
        setLoading(false);
        return;
      }

      // Step 3: Group shared events by user and count them
      const usersWithSharedEvents: Record<string, string[]> = {};
      
      otherRSVPs?.forEach(rsvp => {
        if (!usersWithSharedEvents[rsvp.user_id]) {
          usersWithSharedEvents[rsvp.user_id] = [];
        }
        if ((rsvp.events as any)?.title) {
          usersWithSharedEvents[rsvp.user_id].push((rsvp.events as any).title);
        }
      });

      // Step 4: Filter users with at least 2 shared events
      const usersWithEnoughSharedEvents = Object.entries(usersWithSharedEvents)
        .filter(([userId, events]) => events.length >= 2)
        .map(([userId, events]) => ({ userId, events, count: events.length }));

      if (usersWithEnoughSharedEvents.length === 0) {
        console.log('No users found with 2+ shared events');
        setLoading(false);
        return;
      }

      // Step 5: Get profile information for these users (only those open to connecting)
      const userIds = usersWithEnoughSharedEvents.map(u => u.userId);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, profile_image_url, open_to_connecting')
        .in('id', userIds)
        .eq('open_to_connecting', true);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        setLoading(false);
        return;
      }

      // Step 6: Combine profile data with shared events
      const suggested: SuggestedUser[] = usersWithEnoughSharedEvents
        .map(({ userId, events, count }) => {
          const profile = profiles?.find(p => p.id === userId);
          if (!profile) return null;

          return {
            id: userId,
            name: profile.name || 'Anonymous User',
            profile_image_url: profile.profile_image_url,
            sharedEvents: events,
            sharedEventCount: count,
            open_to_connecting: profile.open_to_connecting || false
          };
        })
        .filter(Boolean) as SuggestedUser[];

      // Sort by number of shared events (highest first)
      suggested.sort((a, b) => b.sharedEventCount - a.sharedEventCount);

      console.log('Found suggested users:', suggested.length);
      setSuggestedUsers(suggested);

    } catch (error) {
      console.error('Error finding suggested users:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    suggestedUsers,
    loading,
    findSuggestedUsers
  };
};