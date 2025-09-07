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
        className={`flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
        style={style}
      >
        <div className="relative">
          <div className={`relative ${hasStories ? 'p-1 rounded-full bg-gradient-to-r from-orange-300 to-orange-500' : ''}`}>
            <Avatar 
              className={`w-[66px] h-[66px] cursor-pointer transition-all duration-200 shadow-lg ${hasStories ? 'border-2 border-white shadow-orange-500/20' : 'border-4 border-purple-400/40 hover:border-purple-500/60 shadow-purple-500/10'}`}
              onClick={handleAvatarClick}
            >
            <AvatarImage 
              src={image} 
              alt={name} 
              className="object-cover"
              loading="lazy"
            />
            <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
            </Avatar>
          </div>
          
          {isCurrentUser && (
            <div 
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: 'hsl(var(--coral))' }}
              onClick={handleAddStoryClick}
            >
              <span className="text-primary-foreground text-xs">+</span>
            </div>
          )}
        </div>
        
        <span 
          className="text-xs font-medium text-center max-w-[70px] truncate text-white cursor-pointer hover:text-primary transition-colors"
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