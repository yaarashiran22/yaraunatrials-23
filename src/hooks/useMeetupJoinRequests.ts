import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface MeetupJoinRequest {
  id: string;
  user_id: string;
  event_id: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  user_profile?: {
    id: string;
    name: string;
    profile_image_url?: string;
  };
}

export const useMeetupJoinRequests = (eventId?: string) => {
  const { user } = useAuth();
  const [joinRequests, setJoinRequests] = useState<MeetupJoinRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch join requests for a specific meetup (for creators)
  const fetchJoinRequests = async (meetupId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select(`
          id,
          user_id,
          event_id,
          status,
          created_at
        `)
        .eq('event_id', meetupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = data?.map(request => request.user_id) || [];
      let profiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, profile_image_url')
          .in('id', userIds);
        profiles = profilesData || [];
      }

      const formattedRequests = data?.map(request => ({
        ...request,
        status: request.status as 'pending' | 'approved' | 'declined',
        user_profile: profiles.find(p => p.id === request.user_id)
      })) || [];

      setJoinRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching join requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch join requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit a join request for a meetup
  const submitJoinRequest = async (meetupId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join meetups",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Check if user already has a request for this meetup
      const { data: existingRequest } = await supabase
        .from('event_rsvps')
        .select('id, status')
        .eq('event_id', meetupId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          toast({
            title: "Request already sent",
            description: "Your join request is pending approval",
          });
          return false;
        } else if (existingRequest.status === 'approved') {
          toast({
            title: "Already joined",
            description: "You're already part of this meetup",
          });
          return false;
        }
      }

      // Create new join request
      const { error } = await supabase
        .from('event_rsvps')
        .insert({
          event_id: meetupId,
          user_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Request sent!",
        description: "Your join request has been sent to the organizer",
      });
      return true;
    } catch (error) {
      console.error('Error submitting join request:', error);
      toast({
        title: "Error",
        description: "Failed to send join request",
        variant: "destructive",
      });
      return false;
    }
  };

  // Approve or decline a join request (for meetup creators)
  const handleJoinRequest = async (rsvpId: string, newStatus: 'approved' | 'declined') => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('update_meetup_join_status', {
        rsvp_id: rsvpId,
        new_status: newStatus
      });

      if (error) throw error;

      if (!data) {
        toast({
          title: "Error",
          description: "You're not authorized to manage this meetup",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: newStatus === 'approved' ? "Request approved!" : "Request declined",
        description: `Join request has been ${newStatus}`,
      });

      // Refresh join requests if we have an eventId
      if (eventId) {
        fetchJoinRequests(eventId);
      }

      return true;
    } catch (error) {
      console.error('Error handling join request:', error);
      toast({
        title: "Error",
        description: "Failed to update join request",
        variant: "destructive",
      });
      return false;
    }
  };

  // Check user's join status for a meetup
  const checkJoinStatus = async (meetupId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('status')
        .eq('event_id', meetupId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.status || null;
    } catch (error) {
      console.error('Error checking join status:', error);
      return null;
    }
  };

  // Fetch join requests when eventId changes
  useEffect(() => {
    if (eventId) {
      fetchJoinRequests(eventId);
    }
  }, [eventId, user]);

  return {
    joinRequests,
    loading,
    submitJoinRequest,
    handleJoinRequest,
    fetchJoinRequests,
    checkJoinStatus
  };
};