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
        className={`flex flex-col items-center gap-3 transition-all duration-300 hover:scale-110 active:scale-95 group ${className}`}
        style={style}
      >
        <div className="relative">
          {/* Enhanced gradient ring for stories */}
          <div className={`relative transition-all duration-500 ${hasStories ? 'p-[3px] rounded-full bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 animate-pulse' : ''}`}>
            <Avatar 
              className={`w-[66px] h-[66px] cursor-pointer transition-all duration-500 shadow-xl transform hover:rotate-3 ${
                hasStories 
                  ? 'border-3 border-white shadow-orange-500/30 hover:shadow-orange-500/50' 
                  : 'border-4 border-primary/30 hover:border-primary/60 shadow-primary/20 hover:shadow-primary/40'
              }`}
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
          
          {/* Enhanced add story button */}
          {isCurrentUser && (
            <div 
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-background flex items-center justify-center cursor-pointer hover:scale-125 transition-all duration-300 bg-gradient-to-r from-primary to-primary-600 shadow-lg hover:shadow-primary/50 active:scale-110"
              onClick={handleAddStoryClick}
            >
              <span className="text-white text-sm font-bold">+</span>
            </div>
          )}
          
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