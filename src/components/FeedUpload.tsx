import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, X, Send, Video, Image } from 'lucide-react';
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
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mediaOnlyMode, setMediaOnlyMode] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clear video if image is selected
      setSelectedVideo(null);
      setVideoPreview(null);
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to ~50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "שגיאה",
          description: "קובץ הווידאו גדול מדי. מקסימום 50MB",
          variant: "destructive"
        });
        return;
      }

      // Clear image if video is selected
      setSelectedImage(null);
      setImagePreview(null);
      
      setSelectedVideo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setImagePreview(null);
    setVideoPreview(null);
  };

  const createPost = async (content?: string, imageUrl?: string, videoUrl?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content || '',
          image_url: imageUrl || null,
          video_url: videoUrl || null,
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
    // Allow posting with just media (photo/video only) or media with caption
    if (!content.trim() && !selectedImage && !selectedVideo) {
      toast({
        title: "שגיאה",
        description: "נא להוסיף תוכן, תמונה או וידאו",
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
      let videoUrl = '';
      
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

      if (selectedVideo) {
        // Upload video to Supabase storage
        const fileExt = selectedVideo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`; // User ID folder structure required by RLS

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, selectedVideo);

        if (uploadError) {
          console.error('Video upload error:', uploadError);
          throw uploadError;
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);

        videoUrl = urlData.publicUrl;
        console.log('Video uploaded successfully:', videoUrl);
      }

      // Create the post
      const post = await createPost(content.trim() || undefined, imageUrl || undefined, videoUrl || undefined);
      
      if (post) {
        setContent('');
        setSelectedImage(null);
        setSelectedVideo(null);
        setImagePreview(null);
        setVideoPreview(null);
        setIsExpanded(false);
        setMediaOnlyMode(false);
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
            placeholder="שתפ.י פוסט, תמונה או וידאו עם השכונה"
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
              placeholder={mediaOnlyMode ? "כתוב כיתוב (אופציונלי)..." : "שתפ.י פוסט עם השכונה"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none border-none shadow-none p-0 bg-transparent text-foreground placeholder:text-muted-foreground"
              rows={mediaOnlyMode ? 2 : 3}
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
              onClick={removeMedia}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {videoPreview && (
          <div className="relative">
            <video
              src={videoPreview}
              controls
              className="w-full max-h-64 rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeMedia}
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
                  <Image className="h-4 w-4" />
                </span>
              </Button>
            </label>

            <input
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                asChild
              >
                <span>
                  <Video className="h-4 w-4" />
                </span>
              </Button>
            </label>

            {(selectedImage || selectedVideo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMediaOnlyMode(!mediaOnlyMode)}
                className={`text-xs ${mediaOnlyMode ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              >
                {mediaOnlyMode ? 'מדיה בלבד' : 'עם טקסט'}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(false);
                setMediaOnlyMode(false);
                removeMedia();
                setContent('');
              }}
              className="text-muted-foreground"
            >
              ביטול
            </Button>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={uploading || (!content.trim() && !selectedImage && !selectedVideo)}
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