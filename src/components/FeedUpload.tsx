import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, X, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

interface FeedUploadProps {
  onPostCreated?: () => void;
}

const FeedUpload = ({ onPostCreated }: FeedUploadProps) => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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

  const createPost = async (content?: string, imageUrl?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content || '',
          image_url: imageUrl || null,
          location: 'תל אביב', // Default location
          market: 'israel'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
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

    if (!user) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר כדי לפרסם פוסט",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      let imageUrl = '';
      
      if (selectedImage) {
        // Upload image to Supabase storage
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`; // User ID folder structure required by RLS

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, selectedImage);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
        console.log('Image uploaded successfully:', imageUrl);
      }

      // Create the post
      const post = await createPost(content.trim() || undefined, imageUrl || undefined);
      
      if (post) {
        setContent('');
        setSelectedImage(null);
        setImagePreview(null);
        setIsExpanded(false);
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
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לפרסם את הפוסט",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (!isExpanded) {
    return (
      <div 
        className="bg-white rounded-lg p-4 mb-6 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm border"
        onClick={() => setIsExpanded(true)}
      >
        <img 
          src={profile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <input 
            type="text"
            placeholder="שתפ.י פוסט עם השכונה"
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground border-none outline-none cursor-pointer"
            readOnly
          />
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <img 
            src={profile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <Textarea
              placeholder="שתפ.י פוסט עם השכונה"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none border-none shadow-none p-0 bg-transparent text-foreground placeholder:text-muted-foreground"
              rows={3}
              autoFocus
            />
          </div>
        </div>
        
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
                  <Camera className="h-4 w-4" />
                </span>
              </Button>
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground"
            >
              ביטול
            </Button>
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
    </div>
  );
};

export default FeedUpload;