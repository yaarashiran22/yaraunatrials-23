import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  title: string;
  description?: string;
  price?: number;
  image_url?: string;
  location?: string;
  created_at: string;
  user_id: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Simplified single query for better performance
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('category', 'event')
        .order('created_at', { ascending: false })
        .limit(50); // Increased limit for better UX

      if (error) throw error;
      
      // Filter active events on client side for faster initial load
      const activeEvents = (data || []).filter(item => item.status === 'active');
      setEvents(activeEvents as Event[]);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את האירועים",
        variant: "destructive",
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    refetch: fetchEvents,
  };
};