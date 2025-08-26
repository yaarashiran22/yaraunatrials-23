import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Global query deduplication and caching
export const useOptimizedProfiles = () => {
  return useQuery({
    queryKey: ['profiles-optimized'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, profile_image_url')
        .not('name', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10); // Limit to 10 for faster loading
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useOptimizedNotifications = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['notifications-optimized', userId],
    queryFn: async () => {
      if (!userId) return { notifications: [], unreadCount: 0 };
      
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, title, message, is_read, related_user_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20); // Limit for performance
      
      if (error) throw error;
      
      const notifications = data || [];
      const unreadCount = notifications.filter(n => !n.is_read).length;
      
      return { notifications, unreadCount };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useOptimizedUserLocations = () => {
  return useQuery({
    queryKey: ['user-locations-optimized'],
    queryFn: async () => {
      const { data: locations, error } = await supabase
        .from('user_locations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50); // Limit for performance
        
      if (error) throw error;
      if (!locations?.length) return [];
      
      // Get unique user IDs
      const userIds = [...new Set(locations.map(loc => loc.user_id))];
      
      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, profile_image_url')
        .in('id', userIds);
        
      if (profilesError) throw profilesError;
      
      // Combine locations with profiles
      return locations.map(location => {
        const profile = profiles?.find(p => p.id === location.user_id);
        return profile ? { ...location, profile } : null;
      }).filter(Boolean);
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};