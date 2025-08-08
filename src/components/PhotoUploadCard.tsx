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

      // Save to database (you'll need to create this table)
      const { error: dbError } = await supabase
        .from('daily_photo_submissions')
        .insert({
          user_id: user.id,
          image_url: urlData.publicUrl,
          challenge_date: new Date().toISOString().split('T')[0]
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
      <div className="flex-shrink-0 w-36 lg:w-auto">
        <div className="bg-card border border-dashed border-border rounded-lg p-4 h-48 flex flex-col items-center justify-center text-center hover:bg-accent/50 transition-colors">
          <div className="space-y-3">
            <Button
              onClick={() => setShowCamera(true)}
              variant="outline"
              size="sm"
              disabled={isUploading}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
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
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
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