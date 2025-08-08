import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload, Plus, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CameraModal from "./CameraModal";
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';

interface PhotoUploadCardProps {
  onUploadComplete?: () => void;
}

const PhotoUploadCard = ({ onUploadComplete }: PhotoUploadCardProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert base64 to file
  const base64ToFile = (base64String: string, filename: string): File => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

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

      // Save to database using friends_picture_galleries table
      const { error: dbError } = await supabase
        .from('friends_picture_galleries')
        .insert({
          user_id: user.id,
          images: [urlData.publicUrl],
          title: `Daily photo - ${new Date().toLocaleDateString('he-IL')}`
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

  // Mobile camera capture using Capacitor
  const handleMobileCameraCapture = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      if (image.base64String) {
        const file = base64ToFile(`data:image/jpeg;base64,${image.base64String}`, `daily-photo-${Date.now()}.jpg`);
        await handleFileUpload(file);
      }
    } catch (error: any) {
      console.error('Mobile camera error:', error);
      if (error.message !== 'User cancelled photos app') {
        toast.error("לא ניתן לגשת למצלמה. נסה שוב.");
      }
    }
  };

  const handleCameraCapture = () => {
    setShowOptions(false);
    
    // Check if running on mobile device (Capacitor)
    if (Capacitor.isNativePlatform()) {
      handleMobileCameraCapture();
    } else {
      setShowCamera(true);
    }
  };

  const handleGallerySelect = () => {
    fileInputRef.current?.click();
    setShowOptions(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleWebCameraCapture = (file: File) => {
    handleFileUpload(file);
    setShowCamera(false);
  };

  if (!user) {
    return (
      <div className="flex-shrink-0 w-28 h-32">
        <div className="border border-dashed border-border rounded-lg p-3 h-full flex flex-col items-center justify-center text-center">
          <p className="text-xs text-muted-foreground">התחבר כדי להעלות תמונה</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-shrink-0 w-28 h-32">
        <div 
          className="border-2 border-dashed border-primary/50 rounded-lg h-full flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/70 hover:bg-primary/5 transition-all duration-200"
          onClick={() => setShowOptions(true)}
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center mb-2">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs text-primary font-medium">הוסף תמונה</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Options Dialog */}
      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">הוסף תמונה</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              onClick={handleCameraCapture}
              variant="outline"
              className="h-20 flex flex-col gap-2"
              disabled={isUploading}
            >
              <Camera className="w-6 h-6" />
              <span>צלם עכשיו</span>
            </Button>
            <Button
              onClick={handleGallerySelect}
              variant="outline"
              className="h-20 flex flex-col gap-2"
              disabled={isUploading}
            >
              <ImageIcon className="w-6 h-6" />
              <span>בחר מהגלריה</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleWebCameraCapture}
      />
    </>
  );
};

export default PhotoUploadCard;