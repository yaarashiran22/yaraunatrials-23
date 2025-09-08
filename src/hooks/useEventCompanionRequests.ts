import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CompanionRequest {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

interface CompanionUser {
  id: string;
  name: string;
  profile_image_url?: string;
}

export const useEventCompanionRequests = (eventId: string) => {
  const [isLookingForCompanion, setIsLookingForCompanion] = useState(false);
  const [companionRequests, setCompanionRequests] = useState<CompanionRequest[]>([]);
  const [companionUsers, setCompanionUsers] = useState<CompanionUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if current user is looking for companion
  const checkUserCompanionStatus = async () => {
    if (!user?.id || !eventId) return;

    try {
      const { data, error } = await supabase
        .from('event_companion_requests')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking companion status:', error);
        return;
      }

      setIsLookingForCompanion(!!data);
    } catch (error) {
      console.error('Error checking companion status:', error);
    }
  };

  // Fetch all companion requests for this event
  const fetchCompanionRequests = async () => {
    if (!eventId) return;

    try {
      const { data, error } = await supabase
        .from('event_companion_requests')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            profile_image_url
          )
        `)
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching companion requests:', error);
        return;
      }

      setCompanionRequests(data || []);
      
      // Extract user profiles
      const users = data?.map((request: any) => ({
        id: request.profiles.id,
        name: request.profiles.name || 'Anonymous',
        profile_image_url: request.profiles.profile_image_url
      })) || [];
      
      setCompanionUsers(users);
    } catch (error) {
      console.error('Error fetching companion requests:', error);
    }
  };

  // Toggle companion request
  const toggleCompanionRequest = async () => {
    if (!user?.id || !eventId) return;

    setLoading(true);

    try {
      if (isLookingForCompanion) {
        // Remove companion request
        const { error } = await supabase
          .from('event_companion_requests')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsLookingForCompanion(false);
        toast({
          title: "Removed",
          description: "You're no longer looking for someone to join you at this event"
        });
      } else {
        // Add companion request
        const { error } = await supabase
          .from('event_companion_requests')
          .insert({
            event_id: eventId,
            user_id: user.id
          });

        if (error) throw error;

        setIsLookingForCompanion(true);
        toast({
          title: "Added!",
          description: "You're now looking for someone to join you at this event"
        });
      }

      // Refresh the data
      await fetchCompanionRequests();
    } catch (error) {
      console.error('Error toggling companion request:', error);
      toast({
        title: "Error",
        description: "Failed to update companion request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      checkUserCompanionStatus();
      fetchCompanionRequests();
    }
  }, [eventId, user?.id]);

  return {
    isLookingForCompanion,
    companionRequests,
    companionUsers,
    loading,
    toggleCompanionRequest,
    refetch: fetchCompanionRequests
  };
};