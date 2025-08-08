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

export interface UserPictureGallery {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  created_at: string;
  user_id: string;
  user_profile?: {
    name: string;
    profile_image_url: string;
  };
}

// Fetch today's photo challenge with submissions (optimized)
const fetchTodayChallenge = async (): Promise<DailyPhotoChallenge | null> => {
  const today = new Date().toISOString().split('T')[0];
  
  // First, get the challenge
  const { data: challenge, error: challengeError } = await supabase
    .from('daily_photo_challenges')
    .select(`
      id,
      challenge_date,
      daily_photo_instructions (
        instruction_text
      )
    `)
    .eq('challenge_date', today)
    .single();

  if (challengeError && challengeError.code !== 'PGRST116') {
    throw challengeError;
  }

  if (!challenge) {
    return null;
  }

  // Then, get submissions with profile data in a separate optimized query
  const { data: submissions, error: submissionsError } = await supabase
    .from('daily_photo_submissions')
    .select(`
      id,
      image_url,
      is_anonymous,
      created_at,
      user_id,
      profiles!inner (
        name,
        profile_image_url
      )
    `)
    .eq('challenge_id', challenge.id)
    .order('created_at', { ascending: false });

  if (submissionsError) {
    console.error('Submissions fetch error:', submissionsError);
    // Return challenge without submissions if there's an error
    return {
      id: challenge.id,
      instruction_text: challenge.daily_photo_instructions?.instruction_text || '',
      challenge_date: challenge.challenge_date,
      submissions: []
    };
  }

  return {
    id: challenge.id,
    instruction_text: challenge.daily_photo_instructions?.instruction_text || '',
    challenge_date: challenge.challenge_date,
    submissions: (submissions || []).map((submission: any) => ({
      ...submission,
      user_profile: submission.profiles
    }))
  };
};

// Submit a photo for today's challenge
const submitPhoto = async (params: {
  challengeId: string;
  imageFile: File;
  isAnonymous: boolean;
  userId?: string;
}) => {
  if (!params.userId) {
    throw new Error('User must be authenticated to upload photos');
  }

  // Generate a unique filename
  const fileExt = params.imageFile.name.split('.').pop();
  const fileName = `${params.userId}/${Date.now()}.${fileExt}`;

  // Upload image to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('daily-photos')
    .upload(fileName, params.imageFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('daily-photos')
    .getPublicUrl(fileName);

  // Save submission to database
  const { data, error } = await supabase
    .from('daily_photo_submissions')
    .insert({
      challenge_id: params.challengeId,
      image_url: publicUrl,
      is_anonymous: params.isAnonymous,
      user_id: params.userId
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
  // First get the submission to find the image URL
  const { data: submission, error: fetchError } = await supabase
    .from('daily_photo_submissions')
    .select('image_url')
    .eq('id', submissionId)
    .single();

  if (fetchError) throw fetchError;

  // Extract filename from the URL to delete from storage
  if (submission?.image_url) {
    const url = new URL(submission.image_url);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts.slice(-2).join('/'); // Get user_id/filename

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('daily-photos')
      .remove([fileName]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }
  }

  // Delete from database
  const { error } = await supabase
    .from('daily_photo_submissions')
    .delete()
    .eq('id', submissionId);

  if (error) throw error;
};

// Fetch user picture galleries
const fetchUserPictureGalleries = async (): Promise<UserPictureGallery[]> => {
  const { data, error } = await supabase
    .from('user_picture_galleries')
    .select(`
      id,
      image_url,
      title,
      description,
      created_at,
      user_id,
      profiles!inner (
        name,
        profile_image_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Picture galleries fetch error:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    ...item,
    user_profile: item.profiles
  }));
};

// Add picture to gallery
const addPictureToGallery = async (params: {
  imageFile: File;
  title?: string;
  description?: string;
  userId?: string;
}) => {
  if (!params.userId) {
    throw new Error('User must be authenticated to upload pictures');
  }

  // Generate a unique filename
  const fileExt = params.imageFile.name.split('.').pop();
  const fileName = `${params.userId}/gallery/${Date.now()}.${fileExt}`;

  // Upload image to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('daily-photos')
    .upload(fileName, params.imageFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('daily-photos')
    .getPublicUrl(fileName);

  // Save to picture gallery
  const { data, error } = await supabase
    .from('user_picture_galleries')
    .insert({
      image_url: publicUrl,
      title: params.title,
      description: params.description,
      user_id: params.userId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete picture from gallery
const deletePictureFromGallery = async (pictureId: string) => {
  // First get the picture to find the image URL
  const { data: picture, error: fetchError } = await supabase
    .from('user_picture_galleries')
    .select('image_url')
    .eq('id', pictureId)
    .single();

  if (fetchError) throw fetchError;

  // Extract filename from the URL to delete from storage
  if (picture?.image_url) {
    const url = new URL(picture.image_url);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts.slice(-3).join('/'); // Get user_id/gallery/filename

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('daily-photos')
      .remove([fileName]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }
  }

  // Delete from database
  const { error } = await supabase
    .from('user_picture_galleries')
    .delete()
    .eq('id', pictureId);

  if (error) throw error;
};

export const useDailyPhotoChallenge = () => {
  const queryClient = useQueryClient();

  const { data: challenge, isLoading, error, refetch } = useQuery({
    queryKey: ['daily-photo-challenge'],
    queryFn: fetchTodayChallenge,
    staleTime: 60000, // Reduced to 1 minute for faster updates
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: true, // Enable refetch on focus for fresh data
    retry: 1, // Reduce retries for faster failures
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

  const { data: pictureGalleries, isLoading: galleriesLoading, refetch: refetchGalleries } = useQuery({
    queryKey: ['user-picture-galleries'],
    queryFn: fetchUserPictureGalleries,
    staleTime: 60000,
    gcTime: 300000,
  });

  const addPictureMutation = useMutation({
    mutationFn: addPictureToGallery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-picture-galleries'] });
      toast({
        title: "תמונה נוספה בהצלחה!",
        description: "התמונה שלך נוספה לגלריה",
      });
    },
    onError: (error) => {
      console.error('Picture addition error:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את התמונה",
        variant: "destructive",
      });
    },
  });

  const deletePictureMutation = useMutation({
    mutationFn: deletePictureFromGallery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-picture-galleries'] });
      toast({
        title: "תמונה נמחקה בהצלחה!",
        description: "התמונה הוסרה מהגלריה",
      });
    },
    onError: (error) => {
      console.error('Picture deletion error:', error);
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
      staleTime: 60000,
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
    // Picture gallery functions
    pictureGalleries,
    galleriesLoading,
    refetchGalleries,
    addPictureToGallery: addPictureMutation.mutate,
    isAddingPicture: addPictureMutation.isPending,
    deletePictureFromGallery: deletePictureMutation.mutate,
    isDeletingPicture: deletePictureMutation.isPending,
  };
};