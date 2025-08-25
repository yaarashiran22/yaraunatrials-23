
import { useNavigate } from "react-router-dom";
import { useStories } from "@/hooks/useStories";
import { useState } from "react";
import StoriesPopup from "./StoriesPopup";
import ProfilePictureViewer from "./ProfilePictureViewer";

interface ProfileCardProps {
  image: string;
  name: string;
  className?: string;
  id?: string;
}

const ProfileCard = ({ image, name, className = "", id = "1" }: ProfileCardProps) => {
  const navigate = useNavigate();
  const { stories, loading, refetch } = useStories(id);
  const [showStories, setShowStories] = useState(false);
  const [showProfilePicture, setShowProfilePicture] = useState(false);
  
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

  // Generate border color based on whether user has announcements
  const getBorderColor = (stories: any[]) => {
    const hasAnnouncements = stories.some(story => story.is_announcement);
    if (hasAnnouncements) {
      return "bg-gradient-to-br from-yellow-400 to-yellow-600";
    }
    return "bg-gradient-to-br from-pink-400 to-[#BB31E9]";
  };

  return (
    <>
      <div 
        className={`flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        onClick={handleClick}
      >
        <div className="relative">
          <div className={`w-16 h-16 rounded-full ${getBorderColor(stories)} p-0.5`}>
            <div 
              className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-card"
            >
              <img 
                src={image || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"} 
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Story indicator */}
            {stories.length > 0 && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-500 rounded-full border-2 border-background flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
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
    </>
  );
};

export default ProfileCard;
