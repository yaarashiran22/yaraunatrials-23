import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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

const fetchEvents = async (): Promise<Event[]> => {
  // Optimized query - fetch only essential fields for initial load
  const { data, error } = await supabase
    .from('items')
    .select(`
      id,
      title,
      description,
      price,
      image_url,
      location,
      created_at,
      user_id
    `)
    .eq('category', 'event')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(100); // Increased limit for better coverage

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return data || [];
};

export const useEvents = () => {
  const {
    data: events = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes - events don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    // Enable background updates but don't show loading state
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes in background
  });

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את האירועים",
        variant: "destructive",
      });
    }
  }, [error]);

  return {
    events,
    loading,
    refetch,
  };
};