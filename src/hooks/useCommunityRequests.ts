import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCommunityRequests = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const approveMembershipRequest = async (membershipId: string, communityName: string, userName: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('update_community_membership_status', {
        membership_id: membershipId,
        new_status: 'approved'
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Request Approved",
          description: `${userName} has been approved to join ${communityName}`,
        });
        return true;
      } else {
        throw new Error('Unauthorized to approve this request');
      }
    } catch (error) {
      console.error('Error approving membership:', error);
      toast({
        title: "Error",
        description: "Failed to approve membership request",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectMembershipRequest = async (membershipId: string, communityName: string, userName: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('update_community_membership_status', {
        membership_id: membershipId,
        new_status: 'declined'
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Request Rejected",
          description: `${userName}'s request to join ${communityName} has been rejected`,
        });
        return true;
      } else {
        throw new Error('Unauthorized to reject this request');
      }
    } catch (error) {
      console.error('Error rejecting membership:', error);
      toast({
        title: "Error",
        description: "Failed to reject membership request",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getMembershipRequestDetails = async (notificationId: string, relatedUserId: string) => {
    try {
      // First get the notification details to find the community
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (notificationError) throw notificationError;

      // Get the membership request details
      const { data: membership, error: membershipError } = await supabase
        .from('community_members')
        .select(`
          id,
          community_id,
          status,
          communities:community_id (
            name,
            creator_id
          )
        `)
        .eq('user_id', relatedUserId)
        .eq('status', 'pending')
        .single();

      if (membershipError) throw membershipError;

      // Get user details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', relatedUserId)
        .single();

      if (profileError) throw profileError;

      return {
        membershipId: membership.id,
        communityName: membership.communities?.name || 'Unknown Community',
        userName: profile.name || 'Unknown User',
        isCreator: membership.communities?.creator_id === notification.user_id
      };
    } catch (error) {
      console.error('Error getting membership request details:', error);
      return null;
    }
  };

  return {
    approveMembershipRequest,
    rejectMembershipRequest,
    getMembershipRequestDetails,
    loading
  };
};