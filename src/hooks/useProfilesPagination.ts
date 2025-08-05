import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import profile1 from "@/assets/profile-1.jpg";

export interface PaginatedProfile {
  id: string;
  name: string;
  image: string;
}

const PROFILES_PER_PAGE = 20;

const fetchProfiles = async (page: number) => {
  const from = page * PROFILES_PER_PAGE;
  const to = from + PROFILES_PER_PAGE - 1;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, profile_image_url')
    .not('name', 'is', null)
    .eq('show_in_search', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return (data || []).map((profile) => ({
    id: profile.id,
    image: profile.profile_image_url || profile1,
    name: profile.name || 'משתמש'
  }));
};

export const useProfilesPagination = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [allProfiles, setAllProfiles] = useState<PaginatedProfile[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data: newProfiles, isLoading, error } = useQuery({
    queryKey: ['profiles-pagination', currentPage],
    queryFn: () => fetchProfiles(currentPage),
    enabled: hasMore,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  // Update allProfiles when new data arrives
  const updateProfiles = useCallback(() => {
    if (newProfiles) {
      if (newProfiles.length < PROFILES_PER_PAGE) {
        setHasMore(false);
      }
      
      setAllProfiles(prev => {
        // Avoid duplicates by checking if profiles already exist
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewProfiles = newProfiles.filter(p => !existingIds.has(p.id));
        return [...prev, ...uniqueNewProfiles];
      });
    }
  }, [newProfiles]);

  // Call updateProfiles when newProfiles changes
  if (newProfiles && !isLoading) {
    updateProfiles();
  }

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

  const reset = useCallback(() => {
    setCurrentPage(0);
    setAllProfiles([]);
    setHasMore(true);
  }, []);

  return {
    profiles: allProfiles,
    isLoading,
    hasMore,
    loadMore,
    reset,
    error: error?.message || null
  };
};