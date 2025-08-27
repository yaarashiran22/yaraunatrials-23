import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CommunityPerk {
  id: string;
  community_id: string;
  business_name: string;
  title: string;
  description: string;
  discount_amount?: string;
  terms?: string;
  image_url?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
}

const fetchCommunityPerks = async () => {
  try {
    const { data, error } = await supabase
      .from('community_perks')
      .select(`
        *,
        communities!inner(name, logo_url, member_count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching community perks:', error);
    toast({
      title: "Error",
      description: "Failed to load community coupons",
      variant: "destructive",
    });
    throw error;
  }
};

export const useCommunityPerks = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['community-perks'],
    queryFn: fetchCommunityPerks,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    perks: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch
  };
};