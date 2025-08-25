import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Community {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  logo_url?: string;
  category: string;
  subcategory?: string;
  member_count: number;
  is_creator?: boolean;
}

export const useUserCommunities = (userId?: string) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserCommunities = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch communities where user is creator
        const { data: createdCommunities, error: createdError } = await supabase
          .from('communities')
          .select('*')
          .eq('creator_id', userId)
          .eq('is_active', true);

        if (createdError) {
          throw createdError;
        }

        // Fetch communities where user is a member
        const { data: memberships, error: membershipError } = await supabase
          .from('community_members')
          .select(`
            community_id,
            communities!inner(
              id,
              name,
              tagline,
              description,
              logo_url,
              category,
              subcategory,
              member_count
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'approved');

        if (membershipError) {
          throw membershipError;
        }

        // Combine both lists, marking created communities
        const createdWithFlag = (createdCommunities || []).map(community => ({
          ...community,
          is_creator: true
        }));

        const joinedCommunities = (memberships || []).map(membership => ({
          ...(membership.communities as any),
          is_creator: false
        }));

        // Remove duplicates (in case user is both creator and member)
        const allCommunities = [...createdWithFlag];
        joinedCommunities.forEach(joined => {
          if (!allCommunities.find(community => community.id === joined.id)) {
            allCommunities.push(joined);
          }
        });

        setCommunities(allCommunities);
      } catch (err: any) {
        console.error('Error fetching user communities:', err);
        setError(err.message || 'Failed to fetch communities');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCommunities();
  }, [userId]);

  return { communities, loading, error };
};