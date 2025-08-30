import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProfilePhoto {
  id: string;
  photo_url: string;
  display_order: number;
  created_at: string;
}

export const useProfilePhotos = (userId?: string) => {
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchPhotos = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile_photos')
        .select('*')
        .eq('user_id', userId)
        .order('display_order');

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching profile photos:', error);
      toast({
        title: "Error",
        description: "Failed to load profile photos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File, order: number) => {
    if (!userId) return false;

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${order}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('profile_photos')
        .upsert({
          user_id: userId,
          photo_url: publicUrl,
          display_order: order
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });

      await fetchPhotos();
      return true;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId: string, photoUrl: string) => {
    setLoading(true);
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${userId}/${fileName}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('profile-photos')
        .remove([filePath]);

      if (storageError) console.warn('Storage deletion warning:', storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from('profile_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });

      await fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [userId]);

  return {
    photos,
    loading,
    uploading,
    uploadPhoto,
    deletePhoto,
    refetch: fetchPhotos
  };
};