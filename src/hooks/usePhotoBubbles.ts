import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PhotoBubbleData {
  id: string;
  user_id: string;
  image_url: string;
  title?: string;
  description?: string;
  created_at: string;
  profiles?: {
    name?: string;
    profile_image_url?: string;
  };
}

export const usePhotoBubbles = () => {
  const { data: photos = [], isLoading, error, refetch } = useQuery({
    queryKey: ['photo-bubbles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_picture_galleries')
        .select(`
          id,
          user_id,
          image_url,
          title,
          description,
          created_at,
          profiles (
            name,
            profile_image_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as PhotoBubbleData[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    photos,
    isLoading,
    error,
    refetch,
  };
};