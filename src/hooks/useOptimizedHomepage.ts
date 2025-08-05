import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import profile1 from "@/assets/profile-1.jpg";

export interface OptimizedItem {
  id: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  location?: string;
  user_id?: string;
  created_at?: string;
  uploader?: {
    name: string;
    image: string;
    small_photo: string;
    location: string;
  };
}

export interface OptimizedProfile {
  id: string;
  name: string;
  image: string;
}

// Ultra-optimized database queries with aggressive limits for instant mobile loading
const fetchHomepageData = async () => {
  try {
    // Batch all queries in a single Promise.all for maximum performance
    const [marketplaceResult, eventsResult, recommendationsResult, artResult, profilesResult] = await Promise.all([
      supabase
        .from('items')
        .select('id, title, price, image_url, location')
        .eq('status', 'active')
        .eq('category', 'secondhand')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('items')
        .select('id, title, image_url, location, user_id')
        .eq('status', 'active')
        .eq('category', 'event')
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('items')
        .select('id, title, image_url, location')
        .eq('status', 'active')
        .eq('category', 'recommendation')
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('items')
        .select('id, title, image_url, location')
        .eq('status', 'active')
        .eq('category', 'art')
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('profiles')
        .select('id, name, profile_image_url')
        .not('name', 'is', null)
        .eq('show_in_search', true)
        .order('created_at', { ascending: false })
        .limit(10) // Limit profiles for faster loading
    ]);

    if (marketplaceResult.error) throw marketplaceResult.error;
    if (eventsResult.error) throw eventsResult.error;
    if (recommendationsResult.error) throw recommendationsResult.error;
    if (artResult.error) throw artResult.error;
    if (profilesResult.error) throw profilesResult.error;

    const marketplaceItems = marketplaceResult.data || [];
    const rawEvents = eventsResult.data || [];
    const recommendationItems = recommendationsResult.data || [];
    const artItems = artResult.data || [];
    
    // Optimized uploader profile fetching - only fetch if we have events and limit fields
    let databaseEvents: OptimizedItem[] = rawEvents.map(event => ({
      ...event,
      uploader: {
        name: 'משתמש',
        image: profile1,
        small_photo: profile1,
        location: 'לא צוין'
      }
    }));
    
    if (rawEvents.length > 0) {
      const eventUserIds = rawEvents.map(event => event.user_id).filter(Boolean);
      
      if (eventUserIds.length > 0) {
        const [uploaderProfilesResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, name, profile_image_url, location')
            .in('id', eventUserIds)
        ]);
        
        const uploaderProfiles = (uploaderProfilesResult.data || []).reduce((acc: any, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
        
        // Transform events data with uploader info
        databaseEvents = rawEvents.map(event => ({
          ...event,
          uploader: {
            name: uploaderProfiles[event.user_id]?.name || 'משתמש',
            image: uploaderProfiles[event.user_id]?.profile_image_url || profile1,
            small_photo: uploaderProfiles[event.user_id]?.profile_image_url || profile1,
            location: uploaderProfiles[event.user_id]?.location || 'לא צוין'
          }
        }));
      }
    }
    
    const profiles = (profilesResult.data || []).map((profile) => ({
      id: profile.id,
      image: profile.profile_image_url || profile1,
      name: profile.name || 'משתמש'
    }));

    // Combine all items for backward compatibility
    const items = [...marketplaceItems, ...databaseEvents, ...recommendationItems, ...artItems];

    return { items, marketplaceItems, databaseEvents, recommendationItems, artItems, businessItems: [], profiles };
  } catch (error) {
    console.error('Homepage data fetch error:', error);
    toast({
      title: "שגיאה",
      description: "לא ניתן לטעון את הנתונים",
      variant: "destructive",
    });
    throw error;
  }
};

export const useOptimizedHomepage = () => {
  const queryClient = useQueryClient();

  // Preload data on mount
  const preloadData = () => {
    queryClient.prefetchQuery({
      queryKey: ['homepage-data-v3'], // Match main query key
      queryFn: fetchHomepageData,
      staleTime: 180000,
    });
  };

  // Main query with React Query caching and ultra-aggressive optimization for mobile
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['homepage-data-v3'], // Updated key for new optimizations
    queryFn: fetchHomepageData,
    staleTime: 180000, // 3 minutes - balanced performance and freshness
    gcTime: 900000, // 15 minutes - longer persistence
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Use cached data if available
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 500,
  });

  // Extract pre-filtered data for instant mobile loading
  const items = data?.items || [];
  const profiles = data?.profiles || [];
  const marketplaceItems = data?.marketplaceItems || [];
  const databaseEvents = data?.databaseEvents || [];
  const recommendationItems = data?.recommendationItems || [];
  const artItems = data?.artItems || [];
  const businessItems = data?.businessItems || [];

  return {
    items,
    profiles,
    marketplaceItems,
    databaseEvents,
    recommendationItems,
    artItems,
    businessItems,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    preloadData
  };
};