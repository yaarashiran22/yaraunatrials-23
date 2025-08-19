import { useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { PhotoBubbleData } from "@/hooks/usePhotoBubbles";

interface PhotoBubbleProps {
  photo?: PhotoBubbleData;
  isAddButton?: boolean;
  onPhotoAdded?: () => void;
}

const PhotoBubble = ({ 
  photo,
  isAddButton = false, 
  onPhotoAdded 
}: PhotoBubbleProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `photo-bubbles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('user_picture_galleries')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          title: 'תמונה חדשה',
          description: 'הועלתה עכשיו'
        });

      if (dbError) throw dbError;

      toast.success('התמונה הועלתה בהצלחה!');
      onPhotoAdded?.();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('שגיאה בהעלאת התמונה');
    } finally {
      setIsUploading(false);
    }
  };

  if (isAddButton) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-dashed border-primary/40 flex items-center justify-center hover:bg-primary/30 transition-colors">
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Plus className="w-6 h-6 text-primary" />
            )}
          </div>
        </label>
        <span className="text-xs text-muted-foreground">הוסף תמונה</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2 relative">
      <div className="relative">
        <img 
          src={photo?.image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"} 
          alt={photo?.profiles?.name || "תמונה"}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
        />
        {photo?.description && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full min-w-max max-w-20 truncate">
            {photo.description}
          </div>
        )}
      </div>
      <span className="text-xs text-foreground truncate max-w-[60px]">
        {photo?.profiles?.name || 'משתמש'}
      </span>
    </div>
  );
};

export default PhotoBubble;