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
    if (!userId) {
      console.error('No userId provided for photo upload');
      toast({
        title: "Error",
        description: "User ID is required for photo upload",
        variant: "destructive",
      });
      return false;
    }

    console.log('Starting photo upload for user:', userId, 'order:', order);
    setUploading(true);
    
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${order}-${Date.now()}.${fileExt}`;
      
      console.log('Uploading file to storage:', fileName);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);
        
      console.log('Generated public URL:', publicUrl);

      // Check if there's an existing photo for this order
      const { data: existingPhoto } = await supabase
        .from('profile_photos')
        .select('id, photo_url')
        .eq('user_id', userId)
        .eq('display_order', order)
        .maybeSingle();

      // Save to database
      console.log('Saving photo to database...');
      let dbData, dbError;

      if (existingPhoto) {
        // Update existing photo
        console.log('Updating existing photo...');
        const result = await supabase
          .from('profile_photos')
          .update({
            photo_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('display_order', order)
          .select();
        
        dbData = result.data;
        dbError = result.error;

        // Delete old file from storage if it exists and is different
        if (existingPhoto.photo_url && existingPhoto.photo_url !== publicUrl) {
          const oldFileName = existingPhoto.photo_url.split('/').pop();
          if (oldFileName && oldFileName !== fileName.split('/').pop()) {
            console.log('Removing old file from storage:', oldFileName);
            await supabase.storage
              .from('profile-photos')
              .remove([`${userId}/${oldFileName}`]);
          }
        }
      } else {
        // Insert new photo
        console.log('Inserting new photo...');
        const result = await supabase
          .from('profile_photos')
          .insert({
            user_id: userId,
            photo_url: publicUrl,
            display_order: order
          })
          .select();
        
        dbData = result.data;
        dbError = result.error;
      }

      if (dbError) {
        console.error('Database save error:', dbError);
        throw dbError;
      }
      
      console.log('Photo saved to database successfully:', dbData);

      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });

      await fetchPhotos();
      return true;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo",
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