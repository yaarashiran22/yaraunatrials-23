import { useStories } from "@/hooks/useStories";
import { useNavigate } from "react-router-dom";
import profile1 from "@/assets/profile-1.jpg";

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

  return (
    <div className="text-center flex-shrink-0">
      <div className="relative">
        <img 
          src={user.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"} 
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover mx-auto mb-2 cursor-pointer transition-transform duration-200 hover:scale-110 hover:shadow-lg"
          onClick={() => navigate(`/profile/${user.id}`)}
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
      <span className="text-xs text-foreground">{user.name || 'משתמש'}</span>
    </div>
  );
};

export default NeighborCard;