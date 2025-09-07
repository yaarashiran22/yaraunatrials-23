import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  [userId: string]: {
    online_at: string;
    user_id: string;
  }[];
}

export const useUserPresence = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    // Create a presence channel
    const channel = supabase.channel('user_presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = channel;

    // Track current user as online
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState() as UserPresence;
      const onlineUserIds = new Set<string>();
      
      Object.keys(presenceState).forEach(userId => {
        if (presenceState[userId] && presenceState[userId].length > 0) {
          onlineUserIds.add(userId);
        }
      });
      
      setOnlineUsers(onlineUserIds);
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      setOnlineUsers(prev => new Set([...prev, key]));
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track current user as online
        await channel.track({
          online_at: new Date().toISOString(),
          user_id: user.id,
        });
      }
    });

    // Update presence every 30 seconds to keep connection alive
    const interval = setInterval(async () => {
      if (channelRef.current) {
        await channelRef.current.track({
          online_at: new Date().toISOString(),
          user_id: user.id,
        });
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user]);

  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

  return {
    onlineUsers,
    isUserOnline,
  };
};
