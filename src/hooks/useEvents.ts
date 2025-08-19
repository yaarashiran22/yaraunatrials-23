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
  console.log("useEvents hook called");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      console.log("Starting fetchEvents...");
      setLoading(true);
      
      // First try to get ALL items to see if we can fetch anything
      const { data: allData, error: allError } = await supabase
        .from('items')
        .select('*')
        .limit(5);
      
      console.log("All items query:", { allData, allError });
      
      // Now try the specific events query
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('category', 'event')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      console.log("Events query response:", { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Events fetched successfully:', data?.length || 0, 'events');
      setEvents((data || []) as Event[]);
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
    console.log("useEvents useEffect triggered");
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    refetch: fetchEvents,
  };
};