import { useStories } from "@/hooks/useStories";
import { useNavigate } from "react-router-dom";
import profile1 from "@/assets/profile-1.jpg";
import { useState } from "react";
import ProfilePictureViewer from "./ProfilePictureViewer";

interface NeighborCardProps {
  user: {
    id: string;
    name: string;
    profile_image_url?: string;
  };
  onStoryClick: (userId: string) => void;
}

const NeighborCard = ({ user, onStoryClick }: NeighborCardProps) => {
  const navigate = useNavigate();
  const { stories } = useStories(user.id);
  const hasStories = stories.length > 0;
  const [showProfilePicture, setShowProfilePicture] = useState(false);

  const handleProfilePictureClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfilePicture(true);
  };

  return (
    <>
      <div className="text-center flex-shrink-0">
        <div className="relative">
          <img 
            src={user.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"} 
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover mx-auto mb-2 cursor-pointer transition-all duration-300 ease-out hover:scale-125 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/30"
            onClick={handleProfilePictureClick}
          />
          {/* Story indicator - small circle icon */}
          {hasStories && (
            <button
              onClick={() => onStoryClick(user.id)}
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-500 rounded-full border-2 border-background flex items-center justify-center hover:bg-yellow-400 transition-colors"
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            </button>
          )}
        </div>
        <span 
          className="text-xs text-foreground cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          {user.name || 'משתמש'}
        </span>
      </div>
      
      <ProfilePictureViewer
        isOpen={showProfilePicture}
        onClose={() => setShowProfilePicture(false)}
        imageUrl={user.profile_image_url || ""}
        userName={user.name}
        userId={user.id}
      />
    </>
  );
};

export default NeighborCard;