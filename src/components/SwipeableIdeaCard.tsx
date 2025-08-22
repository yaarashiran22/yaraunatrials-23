import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, MapPin, X, Heart } from 'lucide-react';
import { NeighborhoodIdea } from '@/hooks/useNeighborhoodIdeas';
import { useAuth } from '@/contexts/AuthContext';

interface SwipeableIdeaCardProps {
  idea: NeighborhoodIdea;
  onVote: (ideaId: string, vote: boolean) => Promise<boolean>;
  onRemove: () => void;
  isTopCard?: boolean;
}

const SwipeableIdeaCard = ({ idea, onVote, onRemove, isTopCard = false }: SwipeableIdeaCardProps) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragRotation, setDragRotation] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'עכשיו';
    if (diffInMinutes < 60) return `לפני ${diffInMinutes} דקות`;
    if (diffInMinutes < 1440) return `לפני ${Math.floor(diffInMinutes / 60)} שעות`;
    return `לפני ${Math.floor(diffInMinutes / 1440)} ימים`;
  };

  const handleVote = async (vote: boolean) => {
    if (isVoting || !user) return;
    
    setIsVoting(true);
    const success = await onVote(idea.id, vote);
    if (success) {
      // Animate card out
      setDragOffset({ x: vote ? 400 : -400, y: 0 });
      setDragRotation(vote ? 30 : -30);
      setTimeout(() => {
        onRemove();
      }, 300);
    }
    setIsVoting(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTopCard || isVoting) return;
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isTopCard) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    setDragRotation(deltaX * 0.1);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      // Auto-vote based on swipe direction
      handleVote(dragOffset.x > 0);
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
      setDragRotation(0);
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTopCard || isVoting) return;
    setIsDragging(true);
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isTopCard) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    setDragRotation(deltaX * 0.1);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      // Auto-vote based on swipe direction
      handleVote(dragOffset.x > 0);
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
      setDragRotation(0);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset.x]);

  const getSwipeIndicator = () => {
    const threshold = 50;
    if (dragOffset.x > threshold) {
      return (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold transform rotate-12 opacity-80">
          בעד!
        </div>
      );
    } else if (dragOffset.x < -threshold) {
      return (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold transform -rotate-12 opacity-80">
          נגד!
        </div>
      );
    }
    return null;
  };

  return (
    <Card 
      ref={cardRef}
      className={`absolute inset-0 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-300 ${
        isTopCard ? 'z-20' : 'z-10'
      } ${!isTopCard ? 'scale-95 opacity-70' : ''}`}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragRotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CardContent className="p-0 h-full flex flex-col">
        {/* Swipe Indicators */}
        {getSwipeIndicator()}

        {/* Header */}
        <div className="p-4 pb-3 bg-white/95 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={idea.profiles?.profile_image_url || undefined} />
              <AvatarFallback>{idea.profiles?.name?.[0] || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{idea.profiles?.name || 'אנונימי'}</span>
                <span className="text-sm text-muted-foreground">
                  {formatTimeAgo(idea.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{idea.neighborhood}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 relative">
          <img
            src={idea.image_url}
            alt="תמונת רעיון"
            className="w-full h-full object-cover"
          />
          
          {/* Gradient overlay for text readability */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6">
            <p className="text-white text-lg font-medium leading-relaxed">
              {idea.question}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white/95 backdrop-blur-sm">
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleVote(false)}
              disabled={!user || isVoting}
              className="flex-1 gap-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
            >
              <X className="h-5 w-5" />
              נגד
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleVote(true)}
              disabled={!user || isVoting}
              className="flex-1 gap-2 border-green-200 hover:bg-green-50 hover:border-green-300 text-green-600"
            >
              <Heart className="h-5 w-5" />
              בעד
            </Button>
          </div>
          
          {!user && (
            <div className="text-center text-sm text-muted-foreground mt-2">
              התחבר כדי להצביע
            </div>
          )}
          
          {isVoting && (
            <div className="text-center text-sm text-muted-foreground mt-2">
              מצביע...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SwipeableIdeaCard;