import { memo, useState, useCallback, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import ProfilePictureViewer from "./ProfilePictureViewer";

interface OptimizedProfileCardProps {
  id: string;
  image: string;
  name: string;
  className?: string;
  style?: React.CSSProperties;
  isCurrentUser?: boolean;
}

const OptimizedProfileCard = memo(({ 
  id, 
  image, 
  name, 
  className = "", 
  style, 
  isCurrentUser = false 
}: OptimizedProfileCardProps) => {
  const [showProfileViewer, setShowProfileViewer] = useState(false);
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    setShowProfileViewer(true);
  };

  const handleNavigateToProfile = () => {
    if (isCurrentUser) {
      navigate('/profile');
    } else {
      navigate(`/profile/${id}`);
    }
  };

  return (
    <>
      <div
        className={`flex flex-col items-center gap-3 transition-all duration-300 hover:scale-110 active:scale-95 group ${className}`}
        style={style}
      >
        <div className="relative">
          <div className="relative transition-all duration-300">
            <Avatar 
              className="w-[66px] h-[66px] cursor-pointer transition-all duration-300 shadow-xl transform hover:rotate-3 border-4 border-primary/30 hover:border-primary/60 shadow-primary/20 hover:shadow-primary/40"
              onClick={handleAvatarClick}
            >
            <AvatarImage 
              src={image} 
              alt={name} 
              className="object-cover transition-all duration-300 group-hover:brightness-110"
              loading="lazy"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-bold text-lg border border-primary/30">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Online indicator for current user */}
          {isCurrentUser && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-background shadow-lg animate-pulse"></div>
          )}
        </div>
        
        <span 
          className="text-xs font-semibold text-center max-w-[70px] truncate text-white cursor-pointer hover:text-primary transition-all duration-300 hover:scale-105 group-hover:drop-shadow-lg"
          onClick={handleNavigateToProfile}
        >
          {name}
        </span>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"></div>
      </div>

      <ProfilePictureViewer
        isOpen={showProfileViewer}
        onClose={() => setShowProfileViewer(false)}
        imageUrl={image}
        userName={name}
        userId={isCurrentUser ? undefined : id}
      />
    </>
  );
});

OptimizedProfileCard.displayName = 'OptimizedProfileCard';

export default OptimizedProfileCard;