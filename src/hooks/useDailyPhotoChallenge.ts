import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DailyPhotoChallenge {
  id: string;
  instruction_text: string;
  challenge_date: string;
  submissions: DailyPhotoSubmission[];
}

export interface DailyPhotoSubmission {
  id: string;
  image_url: string;
  is_anonymous: boolean;
  created_at: string;
  user_id?: string;
  user_profile?: {
    name: string;
    profile_image_url: string;
  };
}

// Fetch today's photo challenge with submissions
const fetchTodayChallenge = async (): Promise<DailyPhotoChallenge | null> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: challenge, error } = await supabase
    .from('daily_photo_challenges')
    .select(`
      id,
      challenge_date,
      daily_photo_instructions (
        instruction_text
      ),
      daily_photo_submissions (
        id,
        image_url,
        is_anonymous,
        created_at,
        user_id,
        profiles (
          name,
          profile_image_url
        )
      )
    `)
    .eq('challenge_date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!challenge) {
    return null;
  }

  return {
    id: challenge.id,
    instruction_text: challenge.daily_photo_instructions?.instruction_text || '',
    challenge_date: challenge.challenge_date,
    submissions: (challenge.daily_photo_submissions || []).map((submission: any) => ({
      ...submission,
      user_profile: submission.profiles
    }))
  };
};

// Submit a photo for today's challenge
const submitPhoto = async (params: {
  challengeId: string;
  imageUrl: string;
  isAnonymous: boolean;
  userId?: string;
}) => {
  const { data, error } = await supabase
    .from('daily_photo_submissions')
    .insert({
      challenge_id: params.challengeId,
      image_url: params.imageUrl,
      is_anonymous: params.isAnonymous,
      user_id: params.userId || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Check if user has already submitted today
const checkUserSubmission = async (challengeId: string, userId?: string) => {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('daily_photo_submissions')
    .select('id')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Delete a photo submission
const deletePhoto = async (submissionId: string) => {
  const { error } = await supabase
    .from('daily_photo_submissions')
    .delete()
    .eq('id', submissionId);

  if (error) throw error;
};

export const useDailyPhotoChallenge = () => {
  const queryClient = useQueryClient();

  const { data: challenge, isLoading, error, refetch } = useQuery({
    queryKey: ['daily-photo-challenge'],
    queryFn: fetchTodayChallenge,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const submitPhotoMutation = useMutation({
    mutationFn: submitPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-photo-challenge'] });
      toast({
        title: "תמונה נשלחה בהצלחה!",
        description: "התמונה שלך נוספה לתמונת היום",
      });
    },
    onError: (error) => {
      console.error('Photo submission error:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח את התמונה",
        variant: "destructive",
      });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-photo-challenge'] });
      queryClient.invalidateQueries({ queryKey: ['user-photo-submission'] });
      toast({
        title: "תמונה נמחקה בהצלחה!",
        description: "התמונה שלך הוסרה מתמונת היום",
      });
    },
    onError: (error) => {
      console.error('Photo deletion error:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את התמונה",
        variant: "destructive",
      });
    },
  });

  const checkSubmissionQuery = (challengeId: string, userId?: string) => 
    useQuery({
      queryKey: ['user-photo-submission', challengeId, userId],
      queryFn: () => checkUserSubmission(challengeId, userId),
      enabled: !!challengeId && !!userId,
      staleTime: 300000,
    });

  return {
    challenge,
    isLoading,
    error,
    refetch,
    submitPhoto: submitPhotoMutation.mutate,
    isSubmitting: submitPhotoMutation.isPending,
    deletePhoto: deletePhotoMutation.mutate,
    isDeleting: deletePhotoMutation.isPending,
    checkSubmissionQuery,
  };
};