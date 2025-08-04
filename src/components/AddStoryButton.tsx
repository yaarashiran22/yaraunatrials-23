import { useRef, useState } from "react";
import { Plus, Camera, Image as ImageIcon } from "lucide-react";
import { useStories } from "@/hooks/useStories";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CameraModal from "./CameraModal";

interface AddStoryButtonProps {
  className?: string;
}

const AddStoryButton = ({ className = "" }: AddStoryButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createStory } = useStories();
  const { toast } = useToast();
  const [showOptions, setShowOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

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


  // Mobile camera capture using Capacitor
  const handleMobileCameraCapture = async () => {
    try {
      console.log('Opening mobile camera...');
      
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      if (image.base64String) {
        console.log('Image captured from mobile camera');
        const file = base64ToFile(`data:image/jpeg;base64,${image.base64String}`, `story-${Date.now()}.jpg`);
        await createStoryFromFile(file);
      }
    } catch (error: any) {
      console.error('Mobile camera error:', error);
      if (error.message !== 'User cancelled photos app') {
        toast({
          title: "שגיאה",
          description: "לא ניתן לגשת למצלמה. נסה שוב.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCameraCapture = () => {
    setShowOptions(false);
    
    // Check if running on mobile device (Capacitor)
    if (Capacitor.isNativePlatform()) {
      console.log('Using mobile camera...');
      handleMobileCameraCapture();
    } else {
      console.log('Using web camera...');
      setShowCamera(true);
    }
  };

  const handleGallerySelect = () => {
    fileInputRef.current?.click();
    setShowOptions(false);
  };

  const createStoryFromFile = async (file: File) => {
    console.log('Processing file for story:', file.name);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "שגיאה",
        description: "יש לבחור קובץ תמונה בלבד",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "שגיאה",
        description: "גודל התמונה חייב להיות עד 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating story...');
      const result = await createStory(file);
      console.log('Story created successfully:', result);
      
      toast({
        title: "סטורי נוסף בהצלחה!",
        description: "הסטורי שלך יוסר אוטומטית לאחר 24 שעות",
      });

      // Force page refresh to update all profile cards with new story indicator
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating story:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את הסטורי. נסה שוב.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await createStoryFromFile(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    setShowOptions(true);
  };

  return (
    <>
      <div 
        className={`flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        onClick={handleClick}
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 border-2 border-dashed border-primary/50 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Camera className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
        <span className="text-sm font-medium text-foreground text-center">הוסף סטורי</span>
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
            <DialogTitle className="text-center">הוסף סטורי</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              onClick={handleCameraCapture}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <Camera className="w-6 h-6" />
              <span>צלם עכשיו</span>
            </Button>
            <Button
              onClick={handleGallerySelect}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <ImageIcon className="w-6 h-6" />
              <span>בחר מהגלריה</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Modal */}
      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={createStoryFromFile}
      />
    </>
  );
};

export default AddStoryButton;