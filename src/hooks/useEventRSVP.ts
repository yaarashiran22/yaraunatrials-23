import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EventRSVP {
  id: string;
  user_id: string;
  event_id: string;
  status: string;
  created_at: string;
}

const fetchEventRSVP = async (eventId: string, userId: string | null): Promise<EventRSVP | null> => {
  if (!userId || !eventId) return null;
  
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching RSVP:', error);
    throw error;
  }

  return data;
};

const fetchEventRSVPCount = async (eventId: string): Promise<number> => {
  if (!eventId) return 0;
  
  const { count, error } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'going');

  if (error) {
    console.error('Error fetching RSVP count:', error);
    throw error;
  }

  return count || 0;
};

const upsertRSVP = async (eventId: string, userId: string, status: string) => {
  const { data, error } = await supabase
    .from('event_rsvps')
    .upsert({
      event_id: eventId,
      user_id: userId,
      status: status
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteRSVP = async (eventId: string, userId: string) => {
  const { error } = await supabase
    .from('event_rsvps')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const useEventRSVP = (eventId: string) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch user's RSVP status
  const { data: userRSVP, isLoading: rsvpLoading } = useQuery({
    queryKey: ['event-rsvp', eventId, user?.id],
    queryFn: () => fetchEventRSVP(eventId, user?.id),
    enabled: !!eventId && !!user?.id,
  });

  // Fetch total RSVP count
  const { data: rsvpCount = 0, isLoading: countLoading } = useQuery({
    queryKey: ['event-rsvp-count', eventId],
    queryFn: () => fetchEventRSVPCount(eventId),
    enabled: !!eventId,
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: ({ status }: { status: string }) => 
      upsertRSVP(eventId, user?.id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-rsvp', eventId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['event-rsvp-count', eventId] });
      toast({
        title: "RSVP מעודכן!",
        description: "התגובה שלך לאירוע נשמרה",
      });
    },
    onError: (error) => {
      console.error('RSVP error:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את ה-RSVP",
        variant: "destructive",
      });
    },
  });

  // Remove RSVP mutation
  const removeRSVPMutation = useMutation({
    mutationFn: () => deleteRSVP(eventId, user?.id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-rsvp', eventId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['event-rsvp-count', eventId] });
      toast({
        title: "RSVP הוסר",
        description: "התגובה שלך לאירוע הוסרה",
      });
    },
    onError: (error) => {
      console.error('Remove RSVP error:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להסיר את ה-RSVP",
        variant: "destructive",
      });
    },
  });

  const handleRSVP = (status: string) => {
    if (!user) {
      toast({
        title: "נדרשת התחברות",
        description: "יש להתחבר כדי להגיב לאירוע",
        variant: "destructive",
      });
      return;
    }

    if (userRSVP?.status === status) {
      // If clicking the same status, remove RSVP
      removeRSVPMutation.mutate();
    } else {
      // Otherwise update RSVP
      rsvpMutation.mutate({ status });
    }
  };

  return {
    userRSVP,
    rsvpCount,
    isLoading: rsvpLoading || countLoading,
    handleRSVP,
    isUpdating: rsvpMutation.isPending || removeRSVPMutation.isPending,
  };
};
