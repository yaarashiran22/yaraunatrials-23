import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PhotoLike {
  id: string;
  user_id: string;
  gallery_id: string;
  image_url: string;
  created_at: string;
}

export const usePhotoLikes = (galleryId?: string, imageUrl?: string) => {
  const [likes, setLikes] = useState<PhotoLike[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch likes for a specific photo
  const fetchLikes = async () => {
    if (!galleryId || !imageUrl) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('photo_gallery_likes')
        .select('*')
        .eq('gallery_id', galleryId)
        .eq('image_url', imageUrl);

      if (error) throw error;

      setLikes(data || []);
      setLikesCount(data?.length || 0);
      
      // Check if current user has liked this photo
      if (user) {
        const userLike = data?.find(like => like.user_id === user.id);
        setIsLiked(!!userLike);
      }
    } catch (error) {
      console.error('Error fetching photo likes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Like a photo
  const likePhoto = async () => {
    if (!user || !galleryId || !imageUrl || isLiked) return false;

    try {
      const { error } = await supabase
        .from('photo_gallery_likes')
        .insert({
          user_id: user.id,
          gallery_id: galleryId,
          image_url: imageUrl
        });

      if (error) throw error;

      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error liking photo:', error);
      return false;
    }
  };

  // Unlike a photo
  const unlikePhoto = async () => {
    if (!user || !galleryId || !imageUrl || !isLiked) return false;

    try {
      const { error } = await supabase
        .from('photo_gallery_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('gallery_id', galleryId)
        .eq('image_url', imageUrl);

      if (error) throw error;

      setIsLiked(false);
      setLikesCount(prev => prev - 1);
      return true;
    } catch (error) {
      console.error('Error unliking photo:', error);
      return false;
    }
  };

  // Toggle like status
  const toggleLike = async () => {
    if (isLiked) {
      return await unlikePhoto();
    } else {
      return await likePhoto();
    }
  };

  useEffect(() => {
    fetchLikes();
  }, [galleryId, imageUrl, user]);

  return {
    likes,
    likesCount,
    isLiked,
    loading,
    likePhoto,
    unlikePhoto,
    toggleLike,
    refreshLikes: fetchLikes
  };
};