import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useStories, Story } from "@/hooks/useStories";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";

interface StoriesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const StoriesPopup = ({ isOpen, onClose, userId }: StoriesPopupProps) => {
  const { stories, loading } = useStories(userId);
  const { profile } = useProfile(userId);
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    navigate(`/profile/${userId}`);
  };

  // Reset to first story when popup opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setProgress(0);
      console.log('Stories popup opened, showing', stories.length, 'stories');
    }
  }, [isOpen, stories.length]);

  // Auto-advance stories every 5 seconds
  useEffect(() => {
    if (!isOpen || stories.length === 0) return;

    console.log(`Story ${currentIndex + 1} of ${stories.length} started`);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story or close
          if (currentIndex < stories.length - 1) {
            console.log(`Moving to story ${currentIndex + 2} of ${stories.length}`);
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            console.log('Reached last story, closing popup');
            onClose();
            return 0;
          }
        }
        return prev + 2; // Increment by 2% every 100ms (5 seconds total)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, stories.length, currentIndex, onClose]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    // Click on left third to go back, right third to go forward
    if (clickX < width / 3) {
      prevStory();
    } else if (clickX > (width * 2) / 3) {
      nextStory();
    }
  };

  if (loading || stories.length === 0) {
    return null;
  }

  const currentStory = stories[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md w-full h-[80vh] p-0 bg-black border-none overflow-hidden"
        onClick={handleDialogClick}
      >
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 z-10 flex gap-1">
          {stories.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: `${
                    index < currentIndex
                      ? 100
                      : index === currentIndex
                      ? progress
                      : 0
                  }%`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-white cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleNameClick}
            >
              <img
                src={profile?.profile_image_url || "/placeholder.svg"}
                alt={profile?.name || "User"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span 
                className="font-medium cursor-pointer hover:underline"
                onClick={handleNameClick}
              >
                {profile?.name || "Unknown"}
              </span>
              <span className="text-xs text-white/70">{currentIndex + 1} of {stories.length}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Content */}
        <div className="relative w-full h-full flex items-center justify-center">
          {currentStory.story_type === 'announcement' ? (
            /* Text Announcement Display */
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 p-8">
              <div className="text-center text-white">
                <h3 className="text-xl font-bold mb-4">📢 עדכון מהשכונה</h3>
                <p className="text-lg leading-relaxed max-w-sm">
                  {currentStory.text_content}
                </p>
              </div>
            </div>
          ) : (
            /* Image Story Display */
            <img
              src={currentStory.image_url}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevStory();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          
          {currentIndex < stories.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextStory();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Story timestamp */}
        <div className="absolute bottom-4 left-4 text-white/80 text-sm">
          {new Date(currentStory.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoriesPopup;