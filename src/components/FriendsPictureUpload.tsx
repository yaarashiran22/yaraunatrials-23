import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, Send } from 'lucide-react';
import { useFriendsPictureGalleries } from '@/hooks/useFriendsPictureGalleries';
import { useToast } from '@/hooks/use-toast';

interface FriendsPictureUploadProps {
  onGalleryCreated?: () => void;
}

const FriendsPictureUpload = ({ onGalleryCreated }: FriendsPictureUploadProps) => {
  const [title, setTitle] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { createPictureGallery } = useFriendsPictureGalleries();
  const { toast } = useToast();

  const handleImagesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setSelectedImages(files);
    
    // Create previews for all selected images
    const previews: string[] = [];
    let loadedCount = 0;
    
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[index] = e.target?.result as string;
        loadedCount++;
        
        if (loadedCount === files.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "שגיאה",
        description: "נא לבחור לפחות תמונה אחת",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Convert all images to base64
      const imagePromises = selectedImages.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      const imageUrls = await Promise.all(imagePromises);
      
      const gallery = await createPictureGallery(title.trim() || undefined, imageUrls);
      
      if (gallery) {
        setTitle('');
        setSelectedImages([]);
        setImagePreviews([]);
        onGalleryCreated?.();
        toast({
          title: "גלריית התמונות נוצרה בהצלחה!"
        });
      } else {
        toast({
          title: "שגיאה",
          description: "לא ניתן ליצור את גלריית התמונות",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating picture gallery:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור את גלריית התמונות",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          <Input
            placeholder="כותרת לגלריה (אופציונלי)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <Button
                    variant="secondary"
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesSelect}
                className="hidden"
                id="images-upload"
              />
              <label htmlFor="images-upload">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    <Camera className="h-4 w-4 mr-2" />
                    בחר תמונות
                  </span>
                </Button>
              </label>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={uploading || selectedImages.length === 0}
              size="sm"
            >
              {uploading ? (
                "יוצר גלריה..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  צור גלריה
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendsPictureUpload;