
import { useNavigate } from "react-router-dom";
import { useStories } from "@/hooks/useStories";
import { useState, useRef } from "react";
import { Plus, Camera, Image as ImageIcon, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StoriesPopup from "./StoriesPopup";
import ProfilePictureViewer from "./ProfilePictureViewer";
import CameraModal from "./CameraModal";

interface ProfileCardProps {
  image: string;
  name: string;
  className?: string;
  id?: string;
  isCurrentUser?: boolean;
  style?: React.CSSProperties;
}

const ProfileCard = ({ image, name, className = "", id = "1", isCurrentUser = false, style }: ProfileCardProps) => {
  const navigate = useNavigate();
  const { stories, loading, refetch, createStory, createAnnouncement } = useStories(id);
  const [showStories, setShowStories] = useState(false);
  const [showProfilePicture, setShowProfilePicture] = useState(false);
  const [showAddStoryOptions, setShowAddStoryOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showTextUpdate, setShowTextUpdate] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
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

  const handleClick = async () => {
    console.log('ProfileCard clicked for user:', id, 'Current stories count:', stories.length);
    
    // Always refetch stories to ensure we have the latest data
    try {
      const freshStories = await refetch();
      console.log('After refetch - fresh stories count:', freshStories?.length || 0);
      
      if (freshStories && freshStories.length > 0) {
        console.log('Opening stories popup for user:', id, 'with', freshStories.length, 'stories');
        setShowStories(true);
      } else {
        console.log('No stories found, showing profile picture viewer for:', id);
        setShowProfilePicture(true);
      }
    } catch (error) {
      console.error('Error refetching stories:', error);
      // Fallback to current stories state
      if (stories.length > 0) {
        setShowStories(true);
      } else {
        setShowProfilePicture(true);
      }
    }
  };

  const handleAddStoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAddStoryOptions(true);
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
    setShowAddStoryOptions(false);
    
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
    setShowAddStoryOptions(false);
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

  const handleTextUpdate = () => {
    setShowAddStoryOptions(false);
    setShowTextUpdate(true);
  };

  const createTextUpdate = async () => {
    if (!updateText.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין תוכן לעדכון",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating text update...');
      const result = await createAnnouncement(updateText.trim());
      console.log('Text update created successfully:', result);
      
      toast({
        title: "עדכון פורסם בהצלחה!",
        description: "העדכון שלך מוצג כעת בפרופיל שלך עם מסגרת צהובה",
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
        title: "שגיאה",
        description: "לא ניתן להוסיף את העדכון. נסה שוב.",
        variant: "destructive",
      });
    }
  };

  // Generate border color and thickness based on whether user has announcements
  const getBorderColor = (stories: any[]) => {
    const hasAnnouncements = stories.some(story => story.is_announcement);
    if (hasAnnouncements) {
      return "bg-gradient-to-br from-orange-400 to-red-400";
    }
    return "bg-gradient-to-br from-pink-400 to-[#BB31E9]";
  };

  const getBorderThickness = (stories: any[]) => {
    const hasAnnouncements = stories.some(story => story.is_announcement);
    if (hasAnnouncements) {
      return "p-[3px]"; // Keep original thickness for yellow (announcement) borders
    }
    return "p-[2px]"; // Thinner purple border for regular stories
  };

  return (
    <>
      <div 
        className={`flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        onClick={handleClick}
        style={style}
      >
        <div className="relative">
          <div className={`w-[66px] h-[66px] rounded-full ${getBorderColor(stories)} ${getBorderThickness(stories)} card-3d`}>
            <div 
              className="w-full h-full rounded-full overflow-hidden border-2 border-white depth-2"
            >
              <img 
                src={image || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"} 
                alt={name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            </div>
            {/* Story indicator for other users */}
            {!isCurrentUser && stories.length > 0 && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 rounded-full border-[3px] border-white flex items-center justify-center depth-3 floating-element glow-accent">
                <div className="w-4 h-4 bg-orange-50 rounded-full inner-shadow animate-pulse-glow"></div>
              </div>
            )}
            {/* Add story button for current user */}
            {isCurrentUser && (
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-orange-300 flex items-center justify-center cursor-pointer shadow-sm hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
                onClick={handleAddStoryClick}
              >
                <Plus className="w-2.5 h-2.5 text-orange-600" />
              </div>
            )}
          </div>
        </div>
        <span className="text-sm font-medium text-foreground text-center">{name}</span>
      </div>
      
      <StoriesPopup 
        isOpen={showStories}
        onClose={() => setShowStories(false)}
        userId={id}
      />
      
      <ProfilePictureViewer
        isOpen={showProfilePicture}
        onClose={() => setShowProfilePicture(false)}
        imageUrl={image}
        userName={name}
        userId={id}
      />

      {/* Add Story Options Dialog - Only for current user */}
      {isCurrentUser && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Dialog open={showAddStoryOptions} onOpenChange={setShowAddStoryOptions}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center">הוסף סטורי או עדכון</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
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
                <Button
                  onClick={handleTextUpdate}
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span>עדכון טקסט</span>
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
                <DialogTitle className="text-center">הוסף עדכון טקסט</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder="מה קורה אצלך בשכונה?"
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  className="min-h-[120px]"
                  maxLength={500}
                />
                <div className="text-sm text-muted-foreground text-left">
                  {updateText.length}/500 תווים
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={createTextUpdate}
                    disabled={!updateText.trim()}
                    className="flex-1"
                  >
                    פרסם עדכון
                  </Button>
                  <Button
                    onClick={() => {
                      setShowTextUpdate(false);
                      setUpdateText("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    ביטול
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};

export default ProfileCard;
