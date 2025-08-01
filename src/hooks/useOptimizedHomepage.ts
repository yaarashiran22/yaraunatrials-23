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
  created_at: string;
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

// Optimized database queries with pre-filtering for faster mobile loading
const fetchHomepageData = async () => {
  try {
    // Parallel optimized queries with database-level filtering for mobile performance
    const [marketplaceResult, eventsResult, recommendationsResult, artResult, businessResult, profilesResult] = await Promise.all([
      supabase
        .from('items')
        .select('id, title, description, price, category, image_url, location, created_at')
        .eq('status', 'active')
        .eq('category', 'secondhand')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('items')
        .select('id, title, description, price, category, image_url, location, created_at, user_id')
        .eq('status', 'active')
        .eq('category', 'event')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('items')
        .select('id, title, description, price, category, image_url, location, created_at')
        .eq('status', 'active')
        .eq('category', 'recommendation')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('items')
        .select('id, title, description, price, category, image_url, location, created_at')
        .eq('status', 'active')
        .eq('category', 'art')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('items')
        .select('id, title, description, price, category, image_url, location, created_at')
        .eq('status', 'active')
        .eq('category', 'business')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('profiles')
        .select('id, name, profile_image_url')
        .not('name', 'is', null)
        .eq('show_in_search', true)
        .order('created_at', { ascending: false })
        .limit(12)
    ]);

    if (marketplaceResult.error) throw marketplaceResult.error;
    if (eventsResult.error) throw eventsResult.error;
    if (recommendationsResult.error) throw recommendationsResult.error;
    if (artResult.error) throw artResult.error;
    if (businessResult.error) throw businessResult.error;
    if (profilesResult.error) throw profilesResult.error;

    const marketplaceItems = marketplaceResult.data || [];
    const rawEvents = eventsResult.data || [];
    const recommendationItems = recommendationsResult.data || [];
    const artItems = artResult.data || [];
    const businessItems = businessResult.data || [];
    
    // Fetch uploader profile data for events
    const eventUserIds = rawEvents.map(event => event.user_id).filter(Boolean);
    let uploaderProfiles = {};
    let uploaderSmallProfiles = {};
    
    if (eventUserIds.length > 0) {
      const [profilesResult, smallProfilesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name, profile_image_url, location')
          .in('id', eventUserIds),
        supabase
          .from('smallprofiles')
          .select('id, photo')
          .in('id', eventUserIds)
      ]);
      
      uploaderProfiles = (profilesResult.data || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
      
      uploaderSmallProfiles = (smallProfilesResult.data || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
    }
    
    // Transform events data to include uploader info
    const databaseEvents = rawEvents.map(event => ({
      ...event,
      uploader: {
        name: uploaderProfiles[event.user_id]?.name || 'משתמש',
        image: uploaderProfiles[event.user_id]?.profile_image_url || profile1,
        small_photo: uploaderSmallProfiles[event.user_id]?.photo || profile1,
        location: uploaderProfiles[event.user_id]?.location || 'לא צוין'
      }
    }));
    
    const profiles = (profilesResult.data || []).map((profile) => ({
      id: profile.id,
      image: profile.profile_image_url || profile1,
      name: profile.name || 'משתמש'
    }));

    // Combine all items for backward compatibility
    const items = [...marketplaceItems, ...databaseEvents, ...recommendationItems, ...artItems, ...businessItems];

    return { items, marketplaceItems, databaseEvents, recommendationItems, artItems, businessItems, profiles };
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
      queryKey: ['homepage-data'],
      queryFn: fetchHomepageData,
      staleTime: 30000,
    });
  };

  // Main query with React Query caching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['homepage-data'],
    queryFn: fetchHomepageData,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
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