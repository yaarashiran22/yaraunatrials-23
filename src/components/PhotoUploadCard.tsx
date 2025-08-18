import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [showCaptionDialog, setShowCaptionDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
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

  // Validate caption (max 4 words)
  const validateCaption = (text: string): boolean => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length <= 4;
  };

  const handleCaptionChange = (value: string) => {
    if (validateCaption(value)) {
      setCaption(value);
    }
  };

  const handleFileUploadWithCaption = async (file: File, caption: string) => {
    if (!user) {
      toast.error("יש להתחבר כדי להעלות תמונה");
      return;
    }

    console.log('Starting file upload:', file.name);
    setIsUploading(true);
    try {
      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading to storage:', fileName);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('daily-photos')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('daily-photos')
        .getPublicUrl(fileName);

      console.log('Public URL:', urlData.publicUrl);

      // Save to database using friends_picture_galleries table with caption
      console.log('Saving to database...');
      const { error: dbError } = await supabase
        .from('friends_picture_galleries')
        .insert({
          user_id: user.id,
          images: [urlData.publicUrl],
          title: caption || `Daily photo - ${new Date().toLocaleDateString('he-IL')}`,
          caption: caption
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      console.log('Database insert successful');
      toast.success("התמונה הועלתה בהצלחה!");
      onUploadComplete?.();
      
      // Reset state
      setSelectedFile(null);
      setCaption("");
      setShowCaptionDialog(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("שגיאה בהעלאת התמונה: " + (error as any)?.message || 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelection = (file: File) => {
    console.log('PhotoUploadCard - File selected:', file.name, file.size);
    setSelectedFile(file);
    setShowCaptionDialog(true);
    console.log('PhotoUploadCard - Caption dialog should show:', true);
  };

  const handleUploadWithCaption = () => {
    if (selectedFile) {
      handleFileUploadWithCaption(selectedFile, caption);
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
        handleFileSelection(file);
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
    console.log('PhotoUploadCard - File input changed');
    const file = event.target.files?.[0];
    console.log('PhotoUploadCard - Selected file from input:', file);
    if (file) {
      handleFileSelection(file);
    } else {
      console.log('PhotoUploadCard - No file selected');
    }
  };

  const handleWebCameraCapture = (file: File) => {
    handleFileSelection(file);
    setShowCamera(false);
  };

  const wordCount = caption.trim().split(/\s+/).filter(word => word.length > 0).length;

  if (!user) {
    return (
      <div className="flex-shrink-0 w-36">
        <div className="border border-dashed border-border rounded-xl aspect-[4/3] flex items-center justify-center text-center">
          <p className="text-xs text-muted-foreground px-2">התחבר כדי להעלות תמונה</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-shrink-0 w-36">
        <div 
          className="border-2 border-dashed border-primary/50 rounded-xl aspect-[4/3] flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/70 hover:bg-primary/5 transition-all duration-200"
          onClick={() => setShowOptions(true)}
        >
          <Plus className="w-6 h-6 text-primary mb-1" />
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

      {/* Caption Dialog */}
      <Dialog open={showCaptionDialog} onOpenChange={(open) => {
        console.log('PhotoUploadCard - Caption dialog onOpenChange:', open);
        setShowCaptionDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">הוסף כותרת לתמונה</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedFile && (
              <div className="aspect-square w-32 mx-auto rounded-lg overflow-hidden">
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="caption">כותרת (עד 4 מילים)</Label>
              <Input
                id="caption"
                value={caption}
                onChange={(e) => handleCaptionChange(e.target.value)}
                placeholder="הוסף כותרת קצרה..."
                className="text-right"
                dir="rtl"
              />
              <p className="text-xs text-muted-foreground text-right">
                {wordCount}/4 מילים
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCaptionDialog(false);
                setSelectedFile(null);
                setCaption("");
              }}
            >
              ביטול
            </Button>
            <Button
              onClick={handleUploadWithCaption}
              disabled={isUploading}
            >
              {isUploading ? "מעלה..." : "העלה"}
            </Button>
          </DialogFooter>
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