import { useRef, useState } from "react";
import { Plus, Camera, Image as ImageIcon, MessageSquare } from "lucide-react";
import { useStories } from "@/hooks/useStories";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CameraModal from "./CameraModal";

interface AddStoryButtonProps {
  className?: string;
}

const AddStoryButton = ({ className = "" }: AddStoryButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createStory, createAnnouncement } = useStories();
  const { toast } = useToast();
  const [showOptions, setShowOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showTextUpdate, setShowTextUpdate] = useState(false);
  const [updateText, setUpdateText] = useState("");

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
          title: "Error",
          description: "Could not access camera. Please try again.",
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
        title: "Error",
        description: "Please select an image file only",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be under 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating story...');
      const result = await createStory(file);
      console.log('Story created successfully:', result);
      
      toast({
        title: "Story added successfully!",
        description: "Your story will be automatically removed after 24 hours",
      });

      // Force page refresh to update all profile cards with new story indicator
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Could not add story. Please try again.",
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

  const handleTextUpdate = () => {
    setShowOptions(false);
    setShowTextUpdate(true);
  };

  const createTextUpdate = async () => {
    if (!updateText.trim()) {
      toast({
        title: "Error",
        description: "Please enter content for the update",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating text update...');
      const result = await createAnnouncement(updateText.trim());
      console.log('Text update created successfully:', result);
      
      toast({
        title: "Update posted successfully!",
        description: "Your update is now displayed in your profile with a yellow frame",
      });

      setUpdateText("");
      setShowTextUpdate(false);

      // Force page refresh to update profile cards with announcement indicator
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error creating text update:', error);
      toast({
        title: "Error",
        description: "Could not add update. Please try again.",
        variant: "destructive",
      });
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
        <div className="w-[66px] h-[66px] rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center bg-transparent">
          <Plus className="w-6 h-6 text-white" />
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
            <DialogTitle className="text-center">Add Story or Update</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <Button
              onClick={handleCameraCapture}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <Camera className="w-6 h-6" />
              <span>Take Photo</span>
            </Button>
            <Button
              onClick={handleGallerySelect}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <ImageIcon className="w-6 h-6" />
              <span>Choose from Gallery</span>
            </Button>
            <Button
              onClick={handleTextUpdate}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <MessageSquare className="w-6 h-6" />
              <span>Text Update</span>
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

      {/* Text Update Modal */}
      <Dialog open={showTextUpdate} onOpenChange={setShowTextUpdate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Add Text Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="What's happening in your neighborhood?"
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              className="min-h-[120px]"
              maxLength={500}
            />
            <div className="text-sm text-muted-foreground text-left">
              {updateText.length}/500 characters
            </div>
            <div className="flex gap-2">
              <Button
                onClick={createTextUpdate}
                disabled={!updateText.trim()}
                className="flex-1"
              >
                Post Update
              </Button>
              <Button
                onClick={() => {
                  setShowTextUpdate(false);
                  setUpdateText("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddStoryButton;