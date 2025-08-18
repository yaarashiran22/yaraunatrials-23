import { useState } from "react";
import { Trash2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePhotoLikes } from "@/hooks/usePhotoLikes";
import { useAuth } from "@/contexts/AuthContext";

interface DailyPhotoCardProps {
  photoId: string;
  images: string[];
  userName: string;
  userAvatar?: string;
  userId: string;
  currentUserId?: string;
  caption?: string;
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
  caption,
  onDelete,
  onClick 
}: DailyPhotoCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const { user } = useAuth();
  const primaryImage = images[0]; // Use the first image as primary
  const isOwner = currentUserId === userId;
  
  // Use photo likes hook
  const { likesCount, isLiked, toggleLike, loading: likesLoading } = usePhotoLikes(photoId, primaryImage);

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

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!user) {
      toast.error("יש להתחבר כדי לתת לייק");
      return;
    }
    
    const success = await toggleLike();
    if (!success) {
      toast.error("שגיאה בעדכון הלייק");
    }
  };

  const handleDoubleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!user) {
      toast.error("יש להתחבר כדי לתת לייק");
      return;
    }
    
    // Show like animation
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
    
    // Only like if not already liked (double-click to like, not unlike)
    if (!isLiked) {
      const success = await toggleLike();
      if (!success) {
        toast.error("שגיאה בעדכון הלייק");
      }
    }
  };
  
  return (
    <div className="flex-shrink-0 w-36">
      <div 
        className="relative bg-card rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 group cursor-pointer"
        onClick={onClick}
      >
        <div className="aspect-[4/3] overflow-hidden relative">
          <img 
            src={primaryImage} 
            alt={`Daily photo by ${userName}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onDoubleClick={handleDoubleClick}
          />
          
          {/* Like animation overlay */}
          {showLikeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="animate-ping">
                <Heart className="h-12 w-12 text-red-500 fill-red-500 drop-shadow-lg" />
              </div>
            </div>
          )}
        </div>
        
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
        
        {/* Like button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleLike}
          disabled={likesLoading}
        >
          <Heart 
            className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
          />
        </Button>
        
        <div className="p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
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
              <span className="text-xs text-foreground font-medium truncate">
                {userName}
              </span>
            </div>
            {/* Like count */}
            {likesCount > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                <span className="text-xs text-muted-foreground">{likesCount}</span>
              </div>
            )}
          </div>
          
          {/* Caption */}
          {caption && (
            <div className="text-xs text-muted-foreground text-right leading-tight">
              {caption}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyPhotoCard;