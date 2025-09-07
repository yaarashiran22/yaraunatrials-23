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
    console.log('🔗 useUserPresence hook initializing...', user?.id);
    
    if (!user) {
      console.log('❌ No user found, skipping presence setup');
      return;
    }

    console.log('✅ Setting up presence channel for user:', user.id);

    try {
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
        console.log('🔄 Presence sync event received');
        const presenceState = channel.presenceState() as UserPresence;
        const onlineUserIds = new Set<string>();
        
        Object.keys(presenceState).forEach(userId => {
          if (presenceState[userId] && presenceState[userId].length > 0) {
            onlineUserIds.add(userId);
          }
        });
        
        console.log('👥 Online users updated:', Array.from(onlineUserIds));
        setOnlineUsers(onlineUserIds);
      });

      channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('➕ User joined:', key);
        setOnlineUsers(prev => new Set([...prev, key]));
      });

      channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('➖ User left:', key);
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      });

      // Subscribe and track presence
      channel.subscribe(async (status) => {
        console.log('📡 Channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Channel subscribed, tracking user presence');
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
          console.log('🔄 Updating presence heartbeat');
          await channelRef.current.track({
            online_at: new Date().toISOString(),
            user_id: user.id,
          });
        }
      }, 30000);

      return () => {
        console.log('🧹 Cleaning up presence connection');
        clearInterval(interval);
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
      };
    } catch (error) {
      console.error('❌ Error setting up user presence:', error);
    }
  }, [user]);

  const isUserOnline = (userId: string) => {
    const result = onlineUsers.has(userId);
    console.log(`🔍 Checking if user ${userId} is online:`, result);
    return result;
  };

  return {
    onlineUsers,
    isUserOnline,
  };
};
