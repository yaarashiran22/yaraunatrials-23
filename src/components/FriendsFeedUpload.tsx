import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, Send } from 'lucide-react';
import { useFriendsFeedPosts } from '@/hooks/useFriendsFeedPosts';
import { useToast } from '@/hooks/use-toast';

interface FriendsFeedUploadProps {
  onPostCreated?: () => void;
}

const FriendsFeedUpload = ({ onPostCreated }: FriendsFeedUploadProps) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { createPost } = useFriendsFeedPosts();
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedImage) {
      toast({
        title: "שגיאה",
        description: "נא להוסיף תוכן או תמונה",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      let imageUrl = '';
      
      if (selectedImage) {
        // Convert image to base64 for storage
        const reader = new FileReader();
        reader.onload = async (e) => {
          imageUrl = e.target?.result as string;
          
          const post = await createPost(content.trim() || undefined, imageUrl);
          
          if (post) {
            setContent('');
            setSelectedImage(null);
            setImagePreview(null);
            onPostCreated?.();
            toast({
              title: "הפוסט נפרסם בהצלחה!"
            });
          } else {
            toast({
              title: "שגיאה",
              description: "לא ניתן לפרסם את הפוסט",
              variant: "destructive"
            });
          }
          setUploading(false);
        };
        reader.readAsDataURL(selectedImage);
      } else {
        // Text only post
        const post = await createPost(content.trim());
        
        if (post) {
          setContent('');
          onPostCreated?.();
          toast({
            title: "הפוסט נפרסם בהצלחה!"
          });
        } else {
          toast({
            title: "שגיאה",
            description: "לא ניתן לפרסם את הפוסט",
            variant: "destructive"
          });
        }
        setUploading(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לפרסם את הפוסט",
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          <Textarea
            placeholder="מה החדש? שתף עם החברים שלך..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="resize-none"
            rows={3}
          />
          
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-64 object-cover rounded-lg"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    <Camera className="h-4 w-4 mr-2" />
                    תמונה
                  </span>
                </Button>
              </label>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={uploading || (!content.trim() && !selectedImage)}
              size="sm"
            >
              {uploading ? (
                "מפרסם..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  פרסם
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendsFeedUpload;