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
      console.log('Fetching daily photos...');
      const { data, error } = await supabase
        .from('friends_picture_galleries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching daily photos:', error);
        throw error;
      }

      console.log('Daily photos data:', data);

      // Fetch profile data separately for each user_id
      const userIds = [...new Set(data.map(item => item.user_id))];
      console.log('User IDs to fetch profiles for:', userIds);
      
      if (userIds.length === 0) {
        return [];
      }

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, profile_image_url')
        .in('id', userIds);

      console.log('Profiles data:', profilesData);

      // Combine data with profiles
      const photosWithProfiles = data.map(photo => ({
        ...photo,
        profiles: profilesData?.find(profile => profile.id === photo.user_id)
      }));

      console.log('Photos with profiles:', photosWithProfiles);
      return photosWithProfiles as DailyPhotoSubmission[];
    },
  });

  const refetchDailyPhotos = () => {
    console.log('Refetching daily photos...');
    queryClient.invalidateQueries({ queryKey: ['daily-photos'] });
  };

  return {
    dailyPhotos: dailyPhotos || [],
    isLoading,
    refetchDailyPhotos,
  };
};