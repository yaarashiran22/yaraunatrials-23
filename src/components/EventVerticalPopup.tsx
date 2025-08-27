import { X, MessageCircle, Share, Heart, MapPin, Calendar, ChevronUp, ChevronDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useCallback, useEffect } from "react";

// Location mapping from English to Spanish (Buenos Aires neighborhoods)
const locationMapping: Record<string, string> = {
  'palermo': 'Palermo',
  'san-telmo': 'San Telmo', 
  'recoleta': 'Recoleta',
  'puerto-madero': 'Puerto Madero',
  'belgrano': 'Belgrano',
  'villa-crespo': 'Villa Crespo'
};

interface EventVerticalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  event?: {
    id?: string;
    title: string;
    image: string;
    price?: string;
    description?: string;
    date?: string;
    time?: string;
    location?: string;
    organizer?: {
      id?: string;
      name: string;
      image: string;
      location?: string;
    };
    allEvents?: any[];
    currentIndex?: number;
  };
}

const EventVerticalPopup = ({ isOpen, onClose, event }: EventVerticalPopupProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Navigation state
  const allEvents = event?.allEvents || [];
  const currentIndex = event?.currentIndex || 0;

  // Vertical scroll state
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [touchEndY, setTouchEndY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance for vertical navigation
  const minScrollDistance = 80;

  // Navigation functions
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0 && allEvents.length > 0) {
      const prevEvent = allEvents[currentIndex - 1];
      if (prevEvent) {
        const newEvent = {
          ...event,
          id: prevEvent.id,
          title: prevEvent.title,
          image: prevEvent.image_url || prevEvent.image,
          price: prevEvent.price,
          description: prevEvent.description || prevEvent.title,
          date: prevEvent.date,
          time: prevEvent.time,
          location: prevEvent.location,
          organizer: prevEvent.organizer,
          currentIndex: currentIndex - 1
        };
        onClose();
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigateToEvent', { detail: newEvent }));
        }, 100);
      }
    }
  }, [currentIndex, allEvents, event, onClose]);

  const handleNext = useCallback(() => {
    if (currentIndex < allEvents.length - 1 && allEvents.length > 0) {
      const nextEvent = allEvents[currentIndex + 1];
      if (nextEvent) {
        const newEvent = {
          ...event,
          id: nextEvent.id,
          title: nextEvent.title,
          image: nextEvent.image_url || nextEvent.image,
          price: nextEvent.price,
          description: nextEvent.description || nextEvent.title,
          date: nextEvent.date,
          time: nextEvent.time,
          location: nextEvent.location,
          organizer: nextEvent.organizer,
          currentIndex: currentIndex + 1
        };
        onClose();
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigateToEvent', { detail: newEvent }));
        }, 100);
      }
    }
  }, [currentIndex, allEvents, event, onClose]);

  // Vertical touch event handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEndY(0);
    setTouchStartY(e.targetTouches[0].clientY);
    setIsDragging(false);
    setScrollOffset(0);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientY;
    const diff = touchStartY - currentTouch;
    
    if (Math.abs(diff) > 10) {
      setIsDragging(true);
      const maxOffset = 100;
      const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, diff));
      setScrollOffset(limitedOffset);
    }
  }, [touchStartY]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartY || touchEndY) return;
    
    setTouchEndY(e.changedTouches[0].clientY);
    const distance = touchStartY - e.changedTouches[0].clientY;
    const isUpSwipe = distance > minScrollDistance;
    const isDownSwipe = distance < -minScrollDistance;
    
    setIsDragging(false);
    setScrollOffset(0);
    
    // Handle vertical navigation
    if (isUpSwipe && currentIndex < allEvents.length - 1) {
      handleNext();
    } else if (isDownSwipe && currentIndex > 0) {
      handlePrevious();
    }
  }, [touchStartY, touchEndY, currentIndex, allEvents.length, minScrollDistance, handleNext, handlePrevious]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowDown' && currentIndex < allEvents.length - 1) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, allEvents.length, handlePrevious, handleNext]);

  const defaultEvent = {
    id: "1",
    title: "Community Event",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop",
    price: "Free",
    description: "Join us for an amazing community event with great people.",
    date: "2024-01-15",
    time: "19:00",
    location: "Tel Aviv",
    organizer: {
      id: "default",
      name: "Event Organizer",
      image: "https://images.unsplash.com/photo-1494790108755-2616b66dfd8d?w=100&h=100&fit=crop",
      location: "Tel Aviv"
    }
  };

  const displayEvent = event || defaultEvent;

  const handleRSVP = () => {
    toast({
      title: "RSVP Confirmed",
      description: "You've successfully registered for this event",
    });
  };

  const handleShare = () => {
    toast({
      title: "Shared Successfully!",
      description: "Event shared on social networks",
    });
  };

  const handleViewProfile = () => {
    if (displayEvent.organizer?.id) {
      navigate(`/profile/${displayEvent.organizer.id}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" ref={containerRef}>
      {/* Up Navigation Button */}
      {allEvents.length > 1 && currentIndex > 0 && (
        <Button
          variant="ghost"
          size="lg"
          onClick={handlePrevious}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-10 bg-white/90 hover:bg-white text-foreground shadow-lg rounded-full p-3 h-12 w-12"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
      
      {/* Down Navigation Button */}
      {allEvents.length > 1 && currentIndex < allEvents.length - 1 && (
        <Button
          variant="ghost"
          size="lg"
          onClick={handleNext}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/90 hover:bg-white text-foreground shadow-lg rounded-full p-3 h-12 w-12"
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
      )}

      <div 
        ref={contentRef}
        className={`bg-background rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto mx-4 relative transition-transform duration-200 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } event-vertical-popup`}
        style={{
          transform: isDragging ? `translateY(${-scrollOffset}px)` : 'translateY(0px)',
          scrollBehavior: 'smooth'
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            {allEvents.length > 1 && (
              <div className="text-sm text-muted-foreground bg-white/80 dark:bg-black/20 px-3 py-1 rounded-full">
                {currentIndex + 1} / {allEvents.length}
              </div>
            )}
          </div>
        </div>

        {/* Vertical Navigation Instructions */}
        {allEvents.length > 1 && (
          <div className="flex justify-center py-2 border-b bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span>↕ Swipe up/down for more events</span>
            </div>
          </div>
        )}

        {/* Vertical Progress Indicators */}
        {allEvents.length > 1 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
            {allEvents.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-8 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-primary shadow-sm scale-110' : 'bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Event Image */}
          <div className="relative mb-6">
            <div className="border-4 border-gradient-to-r from-green-400 to-blue-400 rounded-2xl overflow-hidden">
              <img 
                src={displayEvent.image}
                alt={displayEvent.title}
                className="w-full h-64 object-cover"
              />
            </div>
            
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-full bg-card/80 backdrop-blur-sm text-red-500"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Event Badge */}
            <div className="absolute top-3 left-3">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Event
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">{displayEvent.title}</h3>
              {displayEvent.price && displayEvent.price !== 'Free' && (
                <p className="text-lg font-semibold text-primary">{displayEvent.price}</p>
              )}
              {(!displayEvent.price || displayEvent.price === 'Free') && (
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">Free Event</p>
              )}
            </div>
            
            {displayEvent.description && (
              <p className="text-foreground leading-relaxed text-center text-sm">
                {displayEvent.description}
              </p>
            )}
            
            {/* Event Details Section */}
            <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg border border-green-200 dark:border-blue-800">
              {displayEvent.location && (
                <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>{locationMapping[displayEvent.location] || displayEvent.location}</span>
                </div>
              )}
              
              {displayEvent.date && (
                <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>
                    {new Date(displayEvent.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
              
              {displayEvent.time && (
                <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>{displayEvent.time}</span>
                </div>
              )}
            </div>

            {/* Organizer Info */}
            {displayEvent.organizer && (
              <div 
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleViewProfile}
              >
                <img 
                  src={displayEvent.organizer.image}
                  alt={displayEvent.organizer.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{displayEvent.organizer.name}</p>
                  {displayEvent.organizer.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{displayEvent.organizer.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RSVP Section */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg border border-green-200 dark:border-blue-800">
            <h4 className="text-lg font-semibold text-foreground mb-3 text-center">Join This Event</h4>
            <p className="text-foreground text-center mb-4 text-sm">
              RSVP to confirm your attendance and stay updated
            </p>
            <Button 
              onClick={handleRSVP}
              className="w-full h-11 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-2xl text-base font-medium"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              RSVP for Event
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventVerticalPopup;