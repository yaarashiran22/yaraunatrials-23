import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DailyPhotoSubmission {
  id: string;
  user_id: string;
  images: string[];
  title?: string;
  created_at: string;
  profiles?: {
    name: string;
    profile_image_url?: string;
  };
}

export const useDailyPhotos = () => {
  const queryClient = useQueryClient();

  const { data: dailyPhotos, isLoading } = useQuery({
    queryKey: ['daily-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friends_picture_galleries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch profile data separately for each user_id
      const userIds = [...new Set(data.map(item => item.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, profile_image_url')
        .in('id', userIds);

      // Combine data with profiles
      const photosWithProfiles = data.map(photo => ({
        ...photo,
        profiles: profilesData?.find(profile => profile.id === photo.user_id)
      }));

      return photosWithProfiles as DailyPhotoSubmission[];
    },
  });

  const refetchDailyPhotos = () => {
    queryClient.invalidateQueries({ queryKey: ['daily-photos'] });
  };

  return {
    dailyPhotos: dailyPhotos || [],
    isLoading,
    refetchDailyPhotos,
  };
};