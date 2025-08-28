import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFollowing = () => {
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFollowing = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('user_following')
        .select(`
          following_id,
          profiles:following_id (
            id,
            name,
            username,
            profile_image_url,
            bio
          )
        `)
        .eq('follower_id', user.id);

      if (error) {
        console.error('Error fetching following:', error);
        return;
      }

      setFollowing(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to follow users",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('user_following')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already following this user",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error following user",
            description: "Please try again",
            variant: "destructive",
          });
        }
        return false;
      }

      toast({
        title: "Now following!",
        description: "You will see their content in your following feed",
      });

      fetchFollowing(); // Refresh the following list
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error following user",
        description: "Please try again",
        variant: "destructive",
      });
      return false;
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { error } = await supabase
        .from('user_following')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
        toast({
          title: "Error unfollowing user",
          description: "Please try again",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Unfollowed successfully",
      });

      fetchFollowing(); // Refresh the following list
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  };

  const isFollowing = (userId: string) => {
    return following.some(follow => follow.following_id === userId);
  };

  useEffect(() => {
    fetchFollowing();
  }, []);

  return {
    following,
    loading,
    followUser,
    unfollowUser,
    isFollowing,
    refreshFollowing: () => fetchFollowing(true)
  };
};