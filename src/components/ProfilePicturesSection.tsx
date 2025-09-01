import React, { useState, useEffect, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfilePicture {
  id: string;
  image_url: string;
  created_at: string;
}

interface ProfilePicturesSectionProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const ProfilePicturesSection = ({ userId, isOwnProfile = false }: ProfilePicturesSectionProps) => {
  const [pictures, setPictures] = useState<ProfilePicture[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  console.log('ProfilePicturesSection - Props:', { userId, isOwnProfile });

  // Fetch user's profile pictures
  const fetchPictures = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_picture_galleries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(2);

      if (error) throw error;
      
      const formattedPictures = (data || []).map(item => ({
        id: item.id,
        image_url: item.image_url,
        created_at: item.created_at
      }));
      
      setPictures(formattedPictures);
    } catch (error) {
      console.error('Error fetching pictures:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload a picture
  const uploadPicture = async (file: File, slot: number) => {
    console.log('uploadPicture called with:', { userId, slot, fileSize: file.size, fileName: file.name });
    
    if (!userId) {
      console.error('No userId provided for photo upload');
      toast({
        title: "Error",
        description: "User ID is required for photo upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/picture-${slot}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      // Check if there's already a picture in this slot
      const existingPicture = pictures[slot - 1];
      
      if (existingPicture) {
        // Update existing picture
        const { error: updateError } = await supabase
          .from('user_picture_galleries')
          .update({ image_url: publicUrl })
          .eq('id', existingPicture.id);

        if (updateError) throw updateError;

        // Delete old file from storage
        const oldFileName = existingPicture.image_url.split('/').pop();
        if (oldFileName && oldFileName !== fileName.split('/').pop()) {
          await supabase.storage
            .from('photos')
            .remove([`${userId}/${oldFileName}`]);
        }
      } else {
        // Insert new picture
        const { error: insertError } = await supabase
          .from('user_picture_galleries')
          .insert({
            user_id: userId,
            image_url: publicUrl,
            title: `Personal Photo ${slot}`
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Picture uploaded successfully",
      });

      fetchPictures();
    } catch (error: any) {
      console.error('Error uploading picture:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete a picture
  const deletePicture = async (pictureId: string, imageUrl: string) => {
    setLoading(true);
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('user_picture_galleries')
        .delete()
        .eq('id', pictureId);

      if (dbError) throw dbError;

      // Delete from storage
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('photos')
          .remove([`${userId}/${fileName}`]);
      }

      toast({
        title: "Success",
        description: "Picture deleted successfully",
      });

      fetchPictures();
    } catch (error: any) {
      console.error('Error deleting picture:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete picture",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, slot: number) => {
    console.log('handleFileSelect called for slot:', slot);
    const file = event.target.files?.[0];
    console.log('File selected:', file ? { name: file.name, size: file.size, type: file.type } : 'No file');
    
    if (file) {
      console.log('Calling uploadPicture...');
      uploadPicture(file, slot);
    } else {
      console.log('No file selected');
    }
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  useEffect(() => {
    console.log('ProfilePicturesSection useEffect triggered, userId:', userId);
    fetchPictures();
  }, [userId]);

  // If no pictures and not own profile, don't render anything
  if (!isOwnProfile && pictures.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Personal Photos</h3>
        {isOwnProfile && (
          <span className="text-sm text-muted-foreground">Share up to 2 photos</span>
        )}
      </div>
      
      <div className="flex gap-3">
        {/* Photo Slot 1 */}
        <div className="relative">
          {isOwnProfile && (
            <input
              ref={fileInputRef1}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 1)}
            />
          )}
          
          {pictures[0] ? (
            <div className="relative group">
              <img
                src={pictures[0].image_url}
                alt="Personal photo 1"
                className="w-32 h-32 object-cover rounded-lg"
              />
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 h-8 w-8"
                    onClick={() => deletePicture(pictures[0].id, pictures[0].image_url)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            isOwnProfile && (
              <button
                onClick={() => {
                  console.log('Add Photo button clicked for slot 1');
                  console.log('fileInputRef1.current:', fileInputRef1.current);
                  fileInputRef1.current?.click();
                }}
                disabled={uploading}
                className="w-32 h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center hover:border-muted-foreground/50 transition-colors duration-200 bg-muted/20"
              >
                <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Add Photo</span>
              </button>
            )
          )}
        </div>

        {/* Photo Slot 2 */}
        <div className="relative">
          {isOwnProfile && (
            <input
              ref={fileInputRef2}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 2)}
            />
          )}
          
          {pictures[1] ? (
            <div className="relative group">
              <img
                src={pictures[1].image_url}
                alt="Personal photo 2"
                className="w-32 h-32 object-cover rounded-lg"
              />
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 h-8 w-8"
                    onClick={() => deletePicture(pictures[1].id, pictures[1].image_url)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            isOwnProfile && (
              <button
                onClick={() => {
                  console.log('Add Photo button clicked for slot 2');
                  console.log('fileInputRef2.current:', fileInputRef2.current);
                  fileInputRef2.current?.click();
                }}
                disabled={uploading}
                className="w-32 h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center hover:border-muted-foreground/50 transition-colors duration-200 bg-muted/20"
              >
                <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Add Photo</span>
              </button>
            )
          )}
        </div>
      </div>
      
      {uploading && (
        <p className="text-sm text-muted-foreground mt-2">Uploading picture...</p>
      )}
    </div>
  );
};

export default ProfilePicturesSection;