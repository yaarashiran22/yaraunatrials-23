import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  profile_image_url: string | null;
  is_private: boolean | null;
  show_in_search: boolean | null;
  interests: string[] | null;
  created_at: string;
  updated_at: string | null;
}

export const useProfile = (profileId?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = useCallback(async () => {
    const targetId = profileId || user?.id;
    
    console.log('Fetching profile for ID:', targetId, 'profileId param:', profileId, 'user.id:', user?.id);
    
    if (!targetId) {
      console.log('No target ID available');
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Querying profiles table for ID:', targetId);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      console.log('Profile query result:', { data, error: fetchError });

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        setError(fetchError.message);
        setProfile(null);
      } else if (!data) {
        console.log('No profile found for ID:', targetId);
        setError('Profile not found');
        setProfile(null);
      } else {
        console.log('Profile loaded successfully:', data);
        setProfile(data);
        setError(null);
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [profileId, user?.id]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    setProfile(data);
    return data;
  }, [user?.id]);

  const uploadProfileImage = useCallback(async (file: File) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/profile.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    uploadProfileImage
  };
};