import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DailyPhotoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  photo?: {
    id: string;
    images: string[];
    userName: string;
    userAvatar?: string;
    userId: string;
    createdAt?: string;
  };
  currentUserId?: string;
  onDelete?: (photoId: string, imageUrl: string) => Promise<void>;
}

const DailyPhotoPopup = ({ 
  isOpen, 
  onClose, 
  photo,
  currentUserId,
  onDelete 
}: DailyPhotoPopupProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !photo) return null;

  const isOwner = currentUserId === photo.userId;
  const primaryImage = photo.images[0];

  const handleDelete = async () => {
    if (!onDelete || !primaryImage) return;
    
    setIsDeleting(true);
    try {
      await onDelete(photo.id, primaryImage);
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'היום';
    return new Date(dateString).toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">גלרייה</h2>
          <div className="flex gap-2">
            {isOwner && onDelete && (
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="aspect-square overflow-hidden">
          <img 
            src={primaryImage} 
            alt={`Daily photo by ${photo.userName}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* User Info */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
              {photo.userAvatar ? (
                <img 
                  src={photo.userAvatar} 
                  alt={photo.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm text-primary font-medium">
                    {photo.userName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-foreground">{photo.userName}</h3>
              <p className="text-sm text-muted-foreground">{formatDate(photo.createdAt)}</p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>הקפה של הבוקר - תמונה יומית מהשכונה</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPhotoPopup;