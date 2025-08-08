import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DailyPhotoCardProps {
  photoId: string;
  images: string[];
  userName: string;
  userAvatar?: string;
  userId: string;
  currentUserId?: string;
  onDelete?: (photoId: string, imageUrl: string) => Promise<void>;
  onClick?: () => void;
}

const DailyPhotoCard = ({ 
  photoId, 
  images, 
  userName, 
  userAvatar, 
  userId, 
  currentUserId,
  onDelete,
  onClick 
}: DailyPhotoCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const primaryImage = images[0]; // Use the first image as primary
  const isOwner = currentUserId === userId;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!onDelete || !primaryImage) return;
    
    setIsDeleting(true);
    try {
      await onDelete(photoId, primaryImage);
      toast.success("התמונה נמחקה בהצלחה");
    } catch (error) {
      toast.error("שגיאה במחיקת התמונה");
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="flex-shrink-0 w-32 h-36">
      <div 
        className="relative rounded-lg overflow-hidden h-full group cursor-pointer"
        onClick={onClick}
      >
        <img 
          src={primaryImage} 
          alt={`Daily photo by ${userName}`}
          className="w-full h-full object-cover"
        />
        
        {/* Delete button - only show for owner */}
        {isOwner && onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-300">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs text-primary font-medium">
                    {userName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-white font-medium truncate">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPhotoCard;