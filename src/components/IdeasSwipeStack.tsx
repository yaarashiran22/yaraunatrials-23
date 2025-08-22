import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Lightbulb } from 'lucide-react';
import { NeighborhoodIdea } from '@/hooks/useNeighborhoodIdeas';
import SwipeableIdeaCard from './SwipeableIdeaCard';

interface IdeasSwipeStackProps {
  ideas: NeighborhoodIdea[];
  onVote: (ideaId: string, vote: boolean) => Promise<boolean>;
  loading?: boolean;
  onRefresh?: () => void;
}

const IdeasSwipeStack = ({ ideas, onVote, loading = false, onRefresh }: IdeasSwipeStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votedIdeas, setVotedIdeas] = useState<string[]>([]);

  // Filter out ideas that have already been voted on
  const availableIdeas = ideas.filter(idea => !votedIdeas.includes(idea.id));
  const currentIdea = availableIdeas[currentIndex];
  const nextIdea = availableIdeas[currentIndex + 1];

  const handleVote = async (ideaId: string, vote: boolean) => {
    const success = await onVote(ideaId, vote);
    if (success) {
      setVotedIdeas(prev => [...prev, ideaId]);
      // Move to next idea
      if (currentIndex < availableIdeas.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }
    return success;
  };

  const handleRemoveCard = () => {
    // Card animation completed, no need to do anything here
    // The index management is handled in handleVote
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setVotedIdeas([]);
    if (onRefresh) {
      onRefresh();
    }
  };

  useEffect(() => {
    // Reset to beginning when new ideas are loaded
    if (ideas.length > 0 && currentIndex >= availableIdeas.length) {
      setCurrentIndex(0);
    }
  }, [ideas.length, availableIdeas.length, currentIndex]);

  if (loading) {
    return (
      <div className="relative w-full max-w-md mx-auto" style={{ height: '70vh' }}>
        <Card className="w-full h-full flex items-center justify-center">
          <CardContent>
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">טוען רעיונות...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (availableIdeas.length === 0 || currentIndex >= availableIdeas.length) {
    return (
      <div className="relative w-full max-w-md mx-auto" style={{ height: '70vh' }}>
        <Card className="w-full h-full flex items-center justify-center">
          <CardContent className="text-center p-8">
            <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">סיימת לצפות בכל הרעיונות!</h3>
            <p className="text-muted-foreground mb-6">
              {votedIdeas.length > 0 
                ? `הצבעת על ${votedIdeas.length} רעיונות` 
                : 'אין רעיונות חדשים כרגע'
              }
            </p>
            
            {votedIdeas.length > 0 && (
              <Button onClick={handleRestart} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                צפה שוב ברעיונות
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto" style={{ height: '70vh' }}>
      {/* Stack container */}
      <div className="relative w-full h-full">
        {/* Next card (background) */}
        {nextIdea && (
          <SwipeableIdeaCard
            key={`${nextIdea.id}-next`}
            idea={nextIdea}
            onVote={handleVote}
            onRemove={handleRemoveCard}
            isTopCard={false}
          />
        )}
        
        {/* Current card (foreground) */}
        {currentIdea && (
          <SwipeableIdeaCard
            key={`${currentIdea.id}-current`}
            idea={currentIdea}
            onVote={handleVote}
            onRemove={handleRemoveCard}
            isTopCard={true}
          />
        )}
      </div>
      
      {/* Progress indicator */}
      <div className="mt-4 text-center">
        <div className="flex justify-center gap-1 mb-2">
          {availableIdeas.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-primary' 
                  : index < currentIndex 
                    ? 'w-2 bg-primary/50'
                    : 'w-2 bg-gray-200'
              }`}
            />
          ))}
          {availableIdeas.length > 5 && (
            <span className="text-sm text-muted-foreground mr-2">
              +{availableIdeas.length - 5}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} מתוך {availableIdeas.length}
        </p>
      </div>
    </div>
  );
};

export default IdeasSwipeStack;