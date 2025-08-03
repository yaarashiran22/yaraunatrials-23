import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, X, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFriendsPictureGalleries } from '@/hooks/useFriendsPictureGalleries';
import { useToast } from '@/hooks/use-toast';

interface FriendsPictureUploadProps {
  onGalleryCreated?: () => void;
}

const FriendsPictureUpload: React.FC<FriendsPictureUploadProps> = ({ onGalleryCreated }) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { createGallery } = useFriendsPictureGalleries();
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setSelectedImages(prev => [...prev, ...files]);
    
    // Create previews for new files
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "שגיאה",
        description: "יש לבחור לפחות תמונה אחת",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "שגיאה",
        description: "עליך להתחבר כדי להעלות תמונות",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload all images
      const uploadPromises = selectedImages.map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Filter out failed uploads
      const successfulUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      if (successfulUrls.length === 0) {
        toast({
          title: "שגיאה",
          description: "נכשל בהעלאת התמונות",
          variant: "destructive",
        });
        return;
      }

      // Create gallery
      const gallery = await createGallery(successfulUrls, title || undefined);
      
      if (gallery) {
        toast({
          title: "הצלחה!",
          description: "הגלריה נוצרה בהצלחה",
        });
        
        // Reset form
        setSelectedImages([]);
        setImagePreviews([]);
        setTitle('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        onGalleryCreated?.();
      } else {
        toast({
          title: "שגיאה",
          description: "נכשל ביצירת הגלריה",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating picture gallery:', error);
      toast({
        title: "שגיאה",
        description: "נכשל ביצירת הגלריה",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          <span className="font-semibold">העלה גלריית תמונות</span>
        </div>
        
        <Input
          placeholder="כותרת הגלריה (אופציונלי)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            {selectedImages.length > 0 ? 'הוסף עוד תמונות' : 'בחר תמונות'}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={selectedImages.length === 0 || uploading}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'מעלה...' : 'פרסם גלריה'}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default FriendsPictureUpload;