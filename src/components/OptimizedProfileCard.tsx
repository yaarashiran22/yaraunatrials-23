import { memo, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import ProfilePictureViewer from "./ProfilePictureViewer";
import AddStoryButton from "./AddStoryButton";
import StoriesPopup from "./StoriesPopup";
import { supabase } from "@/integrations/supabase/client";

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
  const [showAddStory, setShowAddStory] = useState(false);
  const [showStoriesPopup, setShowStoriesPopup] = useState(false);
  const [hasStories, setHasStories] = useState(false);
  const navigate = useNavigate();

  // Check for active stories
  useEffect(() => {
    if (!id) return;
    
    const checkStories = async () => {
      try {
        console.log('Fetching stories for user:', id);
        const { data: stories, error } = await supabase
          .from('stories')
          .select('id')
          .eq('user_id', id)
          .gt('expires_at', new Date().toISOString())
          .limit(1);
          
        if (error) {
          console.error('Error fetching stories:', error);
          return;
        }
        
        console.log('Fetched stories:', stories?.length || 0, 'stories for user:', id);
        setHasStories(stories && stories.length > 0);
      } catch (error) {
        console.error('Error in checkStories:', error);
      }
    };

    checkStories();
  }, [id]);

  const handleAvatarClick = () => {
    if (hasStories) {
      setShowStoriesPopup(true);
    } else {
      setShowProfileViewer(true);
    }
  };

  const handleAddStoryClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering avatar click
    setShowAddStory(true);
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
        className={`flex flex-col items-center gap-2 transition-all duration-300 hover:scale-110 active:scale-95 group ${className}`}
        style={style}
      >
        <div className="relative">
          {/* Glow effect for enhanced visual appeal */}
          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
            hasStories 
              ? 'bg-gradient-to-r from-orange-300/50 to-orange-500/50 blur-md scale-110 group-hover:scale-125' 
              : 'bg-gradient-to-r from-primary/30 to-secondary/30 blur-md scale-110 group-hover:scale-125 opacity-0 group-hover:opacity-100'
          }`}></div>
          
          <div className={`relative ${hasStories ? 'p-1 rounded-full bg-gradient-to-r from-orange-300 to-orange-500' : ''}`}>
            <Avatar 
              className={`w-[66px] h-[66px] cursor-pointer transition-all duration-300 shadow-lg transform group-hover:scale-105 ${
                hasStories 
                  ? 'border-2 border-white shadow-orange-500/30 hover:shadow-orange-500/50' 
                  : 'border-4 border-purple-400/40 hover:border-purple-500/70 shadow-purple-500/20 hover:shadow-purple-500/40'
              }`}
              onClick={handleAvatarClick}
            >
            <AvatarImage 
              src={image} 
              alt={name} 
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-semibold">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
            </Avatar>
          </div>
          
          {isCurrentUser && (
            <div 
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center cursor-pointer hover:scale-125 transition-all duration-200 bg-gradient-to-br from-primary to-secondary shadow-lg hover:shadow-xl"
              onClick={handleAddStoryClick}
            >
              <span className="text-white text-sm font-bold">+</span>
            </div>
          )}
          
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
        
        <span 
          className="text-xs font-semibold text-center max-w-[70px] truncate text-white cursor-pointer hover:text-primary transition-all duration-300 drop-shadow-lg group-hover:scale-105"
          onClick={handleNavigateToProfile}
        >
          {name}
        </span>
      </div>

      <ProfilePictureViewer
        isOpen={showProfileViewer}
        onClose={() => setShowProfileViewer(false)}
        imageUrl={image}
        userName={name}
        userId={isCurrentUser ? undefined : id}
      />

      <StoriesPopup
        isOpen={showStoriesPopup}
        onClose={() => setShowStoriesPopup(false)}
        userId={id}
      />
      
      {/* Add Story functionality */}
      {showAddStory && (
        <div className="fixed inset-0 z-50">
          <AddStoryButton />
          <div 
            className="fixed inset-0 bg-black/50 -z-10"
            onClick={() => setShowAddStory(false)}
          />
        </div>
      )}
    </>
  );
});

OptimizedProfileCard.displayName = 'OptimizedProfileCard';

export default OptimizedProfileCard;