import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
  story_type: 'image' | 'announcement';
  text_content?: string;
  is_announcement: boolean;
}

export const useStories = (userId?: string) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStories = useCallback(async () => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      setStories([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching stories for user:', targetUserId);
      const { data, error: fetchError } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching stories:', fetchError);
        setError(fetchError.message);
        setStories([]);
        return [];
      } else {
        console.log('Fetched stories:', data?.length || 0, 'stories for user:', targetUserId);
        const typedStories = (data || []) as Story[];
        setStories(typedStories);
        setError(null);
        return typedStories;
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred');
      setStories([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId, user?.id]);

  const createStory = useCallback(async (file: File) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('stories')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('stories')
      .getPublicUrl(fileName);

    // Create story record
    const { data, error: createError } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        story_type: 'image',
        is_announcement: false
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Refresh stories
    await fetchStories();
    return data;
  }, [user?.id, fetchStories]);

  const createAnnouncement = useCallback(async (textContent: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    // Create announcement record
    const { data, error: createError } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        image_url: '', // Empty for text announcements
        text_content: textContent,
        story_type: 'announcement',
        is_announcement: true
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Refresh stories
    await fetchStories();
    return data;
  }, [user?.id, fetchStories]);

  const deleteStory = useCallback(async (storyId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    // Refresh stories
    await fetchStories();
  }, [user?.id, fetchStories]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return {
    stories,
    loading,
    error,
    createStory,
    createAnnouncement,
    deleteStory,
    refetch: fetchStories
  };
};