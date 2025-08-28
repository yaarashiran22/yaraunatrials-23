import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfilePictureViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  userName: string;
  userId?: string;
}

const ProfilePictureViewer = ({ isOpen, onClose, imageUrl, userName, userId }: ProfilePictureViewerProps) => {
  const navigate = useNavigate();

  const handleImageClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
      onClose();
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 bg-black/95 border-none">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center justify-center min-h-[60vh] p-8">
            <img
              src={imageUrl || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
              alt={`תמונת פרופיל של ${userName}`}
              className={`max-w-full max-h-[70vh] object-contain rounded-lg ${userId ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
              onClick={handleImageClick}
            />
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
            <p 
              className={`text-white text-lg font-medium ${userId ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
              onClick={handleImageClick}
            >
              {userName}
            </p>
            {userId && (
              <p className="text-white/70 text-sm mt-1">לחץ כדי לצפות בפרופיל</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureViewer;