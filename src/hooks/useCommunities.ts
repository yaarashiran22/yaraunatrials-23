import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Community {
  id: string;
  creator_id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  category: 'interests' | 'causes' | 'identity';
  subcategory: string | null;
  access_type: 'open' | 'closed' | 'invite_only';
  member_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator?: {
    name: string | null;
    profile_image_url: string | null;
  };
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'creator' | 'admin' | 'member';
  status: 'pending' | 'approved' | 'declined';
  joined_at: string;
  created_at: string;
}

export const useCommunities = (category?: string) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunities();
  }, [category]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      
      // First get communities
      let communityQuery = supabase
        .from('communities')
        .select('*')
        .eq('is_active', true)
        .order('member_count', { ascending: false });

      if (category && category !== 'all') {
        communityQuery = communityQuery.eq('category', category);
      }

      const { data: communityData, error: communityError } = await communityQuery;
      if (communityError) throw communityError;

      // Then get creator profiles
      const creatorIds = communityData?.map(c => c.creator_id) || [];
      let profiles: any[] = [];
      
      if (creatorIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, profile_image_url')
          .in('id', creatorIds);
        
        if (profileError) {
          console.warn('Error fetching creator profiles:', profileError);
        } else {
          profiles = profileData || [];
        }
      }

      // Combine the data
      const communitiesWithCreators = (communityData || []).map(community => ({
        ...community,
        creator: profiles.find(p => p.id === community.creator_id) || null
      }));

      setCommunities(communitiesWithCreators as Community[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Set empty array on error so we don't show stale data
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const createCommunity = async (communityData: {
    creator_id: string;
    name: string;
    tagline?: string | null;
    description?: string | null;
    category: 'interests' | 'causes' | 'identity';
    subcategory?: string | null;
    access_type: 'open' | 'closed' | 'invite_only';
  }) => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .insert(communityData)
        .select()
        .single();

      if (error) throw error;

      // Add creator as approved member
      if (data) {
        await supabase
          .from('community_members')
          .insert({
            community_id: data.id,
            user_id: data.creator_id,
            role: 'creator',
            status: 'approved'
          });
      }

      fetchCommunities();
      return data;
    } catch (err) {
      throw err;
    }
  };

  return {
    communities,
    loading,
    error,
    fetchCommunities,
    createCommunity
  };
};

export const useCommunityMembership = () => {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMemberships();
    }
  }, [user]);

  const fetchMemberships = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setMemberships((data || []) as CommunityMember[]);
    } catch (err) {
      console.error('Error fetching memberships:', err);
    } finally {
      setLoading(false);
    }
  };

  const requestToJoin = async (communityId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // First, get the community to check its access type
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('access_type')
        .eq('id', communityId)
        .single();

      if (communityError) throw communityError;

      // Set status based on community access type
      const status = community.access_type === 'open' ? 'approved' : 'pending';

      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id,
          status: status
        });

      if (error) throw error;
      fetchMemberships();
    } catch (err) {
      throw err;
    }
  };

  const getMembershipStatus = (communityId: string): CommunityMember | null => {
    return memberships.find(m => m.community_id === communityId) || null;
  };

  return {
    memberships,
    loading,
    requestToJoin,
    getMembershipStatus,
    fetchMemberships
  };
};