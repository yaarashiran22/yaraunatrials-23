import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFollowing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get list of users the current user is following
  const { data: following = [], isLoading: followingLoading } = useQuery({
    queryKey: ['following', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_following')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) throw error;
      return data?.map(item => item.following_id) || [];
    },
    enabled: !!user?.id,
  });

  // Check if a specific user is being followed
  const isFollowing = (userId: string) => {
    return following.includes(userId);
  };

  // Follow a user
  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_following')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) throw error;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      toast({
        title: "Following",
        description: "You are now following this user",
      });
    },
    onError: (error) => {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  });

  // Unfollow a user
  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_following')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      toast({
        title: "Unfollowed",
        description: "You are no longer following this user",
      });
    },
    onError: (error) => {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  });

  const toggleFollow = (userId: string) => {
    if (isFollowing(userId)) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  return {
    following,
    followingLoading,
    isFollowing,
    toggleFollow,
    isToggling: followMutation.isPending || unfollowMutation.isPending
  };
};