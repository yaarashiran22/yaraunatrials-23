import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CameraModal from "./CameraModal";

interface PhotoUploadCardProps {
  onUploadComplete?: () => void;
}

const PhotoUploadCard = ({ onUploadComplete }: PhotoUploadCardProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error("יש להתחבר כדי להעלות תמונה");
      return;
    }

    setIsUploading(true);
    try {
      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('daily-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('daily-photos')
        .getPublicUrl(fileName);

      // Save to database using friends_picture_galleries table for now
      const { error: dbError } = await supabase
        .from('friends_picture_galleries')
        .insert({
          user_id: user.id,
          image_url: urlData.publicUrl,
          caption: `Daily photo - ${new Date().toLocaleDateString('he-IL')}`
        });

      if (dbError) throw dbError;

      toast.success("התמונה הועלתה בהצלחה!");
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("שגיאה בהעלאת התמונה");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCameraCapture = (file: File) => {
    handleFileUpload(file);
    setShowCamera(false);
  };

  if (!user) {
    return (
      <div className="flex-shrink-0 w-36 lg:w-auto">
        <div className="bg-card border border-dashed border-border rounded-lg p-4 h-48 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground mb-2">התחבר כדי להעלות תמונה</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-shrink-0 w-28 h-32">
        <div className="border-2 border-dashed border-primary/30 rounded-lg p-3 h-full flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
          <div className="space-y-2">
            <Button
              onClick={() => setShowCamera(true)}
              variant="outline"
              size="sm"
              disabled={isUploading}
              className="w-full h-8 text-xs border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60"
            >
              <Camera className="w-3 h-3 mr-1" />
              צלם
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                className="w-full h-8 text-xs border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60"
              >
                <Upload className="w-3 h-3 mr-1" />
                {isUploading ? "מעלה..." : "העלה"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
};

export default PhotoUploadCard;