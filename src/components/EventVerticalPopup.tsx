import { X, MessageCircle, Share, Heart, MapPin, Calendar, ChevronUp, ChevronDown, Clock, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useCallback, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEventCompanionRequests } from "@/hooks/useEventCompanionRequests";
import profile1 from "@/assets/profile-1.jpg";

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
const EventVerticalPopup = ({
  isOpen,
  onClose,
  event
}: EventVerticalPopupProps) => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();

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
          window.dispatchEvent(new CustomEvent('navigateToEvent', {
            detail: newEvent
          }));
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
          window.dispatchEvent(new CustomEvent('navigateToEvent', {
            detail: newEvent
          }));
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
  
  // Companion requests functionality
  const { 
    isLookingForCompanion, 
    companionUsers, 
    loading: companionLoading, 
    toggleCompanionRequest 
  } = useEventCompanionRequests(displayEvent.id || '');
  
  const handleRSVP = () => {
    toast({
      title: "RSVP Confirmed",
      description: "You've successfully registered for this event"
    });
  };
  const handleShare = () => {
    toast({
      title: "Shared Successfully!",
      description: "Event shared on social networks"
    });
  };
  const handleViewProfile = () => {
    if (displayEvent.organizer?.id) {
      navigate(`/profile/${displayEvent.organizer.id}`);
      onClose();
    }
  };

  const handleMessageUser = (userId: string) => {
    navigate(`/messages?userId=${userId}`);
    onClose();
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" ref={containerRef}>
      {/* Up Navigation Button */}
      {allEvents.length > 1 && currentIndex > 0 && <Button variant="ghost" size="lg" onClick={handlePrevious} className="absolute top-8 left-1/2 -translate-x-1/2 z-10 bg-white/90 hover:bg-white text-foreground shadow-xl rounded-full p-4 h-14 w-14 transition-all duration-200 hover:scale-110">
          <ChevronUp className="h-8 w-8" />
        </Button>}
      
      {/* Down Navigation Button */}
      {allEvents.length > 1 && currentIndex < allEvents.length - 1 && <Button variant="ghost" size="lg" onClick={handleNext} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/90 hover:bg-white text-foreground shadow-xl rounded-full p-4 h-14 w-14 transition-all duration-200 hover:scale-110">
          <ChevronDown className="h-8 w-8" />
        </Button>}

      <div ref={contentRef} className={`bg-background/95 backdrop-blur-md rounded-3xl w-full max-w-sm ${isMobile ? 'max-h-[95vh]' : 'max-h-[85vh]'} overflow-y-auto mx-4 relative transition-transform duration-200 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} event-vertical-popup shadow-2xl border border-white/10 animate-scale-in`} style={{
      transform: isDragging ? `translateY(${-scrollOffset}px)` : 'translateY(0px)',
      scrollBehavior: 'smooth'
    }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-green-100/80 to-blue-100/80 dark:from-green-950/40 dark:to-blue-950/40 border-b border-green-200/50 dark:border-blue-800/50">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="relative flex items-center justify-between p-6">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-200 shadow-lg">
              <X className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              {allEvents.length > 1 && <div className="text-sm font-semibold text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                  {currentIndex + 1} / {allEvents.length}
                </div>}
            </div>
          </div>
        </div>

        {/* Vertical Navigation Instructions */}
        {allEvents.length > 1 && <div className="flex justify-center py-3 border-b bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20">
            <div className="text-xs text-muted-foreground flex items-center gap-1 bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full">
              Swipe to navigate
            </div>
          </div>}

        {/* Vertical Progress Indicators */}
        {allEvents.length > 1 && <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
            {allEvents.map((_, index) => <div key={index} className={`w-2 h-10 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary shadow-lg scale-110' : 'bg-muted-foreground/20'}`} />)}
          </div>}

        {/* Content */}
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          {/* Event Image */}
          <div className={`relative ${isMobile ? 'mb-6' : 'mb-8'} group`}>
            <div className="relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
              <img src={displayEvent.image} alt={displayEvent.title} className={`w-full ${isMobile ? 'h-56' : 'h-72'} object-cover transition-transform duration-300 group-hover:scale-105`} />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>
            
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md text-red-500 hover:bg-background/90 hover:scale-110 transition-all duration-200 shadow-lg">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            
          </div>

          {/* Event Details */}
          <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            <div className="text-center space-y-3">
              <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground leading-tight`}>
                {displayEvent.title}
              </h3>
              {displayEvent.price && displayEvent.price !== 'Free' && 
                <div className="inline-flex items-center justify-center">
                  <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent`}>
                    {displayEvent.price}
                  </span>
                </div>
              }
              {(!displayEvent.price || displayEvent.price === 'Free') && 
                <div className="inline-flex items-center justify-center">
                  <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600 dark:text-green-400`}>
                    Free Event
                  </span>
                </div>
              }
            </div>

            {/* Quick RSVP Section - moved to top for quick access */}
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRSVP} className={`${isMobile ? 'h-8 px-4' : 'h-9 px-5'} bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm`}>
                <MessageCircle className="h-3 w-3 mr-1" />
                RSVP
              </Button>
            </div>

            {/* Quick Companion Request - moved to top for quick access */}
            <div className="text-center space-y-3">
              <Button
                onClick={toggleCompanionRequest}
                disabled={companionLoading}
                variant={isLookingForCompanion ? "default" : "outline"}
                className={`${isMobile ? 'h-8 px-4' : 'h-9 px-5'} rounded-full font-medium text-sm transition-all duration-200 hover:scale-105 shadow-sm ${
                  isLookingForCompanion 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0' 
                    : 'border-green-300 text-white hover:bg-green-50 dark:border-green-700 dark:text-white'
                }`}
              >
                <Users className="h-3 w-3 mr-1" />
                {isLookingForCompanion ? 'Stop looking' : 'Find someone to go with'}
              </Button>
              
              {companionUsers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {companionUsers.length} looking for companions:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {companionUsers.slice(0, 3).map((companionUser) => (
                      <div
                        key={companionUser.id}
                        className="flex items-center gap-2 px-3 py-1 bg-green-50/80 dark:bg-green-950/30 rounded-full cursor-pointer hover:bg-green-100/80 dark:hover:bg-green-950/50 transition-all duration-200 hover:scale-105 shadow-sm border border-green-200/50 dark:border-green-800/50"
                        onClick={() => handleMessageUser(companionUser.id)}
                      >
                        <img
                          src={companionUser.profile_image_url || profile1}
                          alt={companionUser.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                          {companionUser.name.split(' ')[0]}
                        </span>
                        <MessageCircle className="h-3 w-3 text-green-600" />
                      </div>
                    ))}
                      {companionUsers.length > 3 && (
                        <div className="flex items-center justify-center w-8 h-6 bg-green-100 dark:bg-green-900 rounded-full">
                          <span className="text-xs font-bold text-green-700 dark:text-green-300">
                            +{companionUsers.length - 3}
                          </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {displayEvent.description && 
              <div className="bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm rounded-2xl p-5 border border-muted/50">
                <p className={`text-foreground/90 leading-relaxed text-center ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {displayEvent.description}
                </p>
              </div>
            }
            
            {/* Event Details Section */}
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'} ${isMobile ? 'p-4' : 'p-5'} bg-gradient-to-r from-green-50/80 to-blue-50/80 dark:from-green-950/40 dark:to-blue-950/40 backdrop-blur-sm rounded-2xl border border-green-200/50 dark:border-blue-800/50`}>
              {displayEvent.location && <div className={`flex items-center gap-4 ${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground`}>
                  <MapPin className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-600 dark:text-green-400`} />
                  <span>{locationMapping[displayEvent.location] || displayEvent.location}</span>
                </div>}
              
              {displayEvent.date && <div className={`flex items-center gap-4 ${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground`}>
                  <Calendar className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-600 dark:text-green-400`} />
                  <span>
                    {new Date(displayEvent.date).toLocaleDateString('en-US', {
                  weekday: isMobile ? 'short' : 'long',
                  year: 'numeric',
                  month: isMobile ? 'short' : 'long',
                  day: 'numeric'
                })}
                  </span>
                </div>}
              
              {displayEvent.time && <div className={`flex items-center gap-4 ${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground`}>
                  <Clock className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-600 dark:text-green-400`} />
                  <span>{displayEvent.time ? displayEvent.time.slice(0, 5) : ''}</span>
                </div>}
            </div>

            {/* Organizer Info */}
            {displayEvent.organizer && <div className={`flex items-center gap-4 ${isMobile ? 'p-4' : 'p-5'} bg-gradient-to-r from-background/60 to-background/40 backdrop-blur-sm rounded-2xl cursor-pointer hover:from-background/80 hover:to-background/60 transition-all duration-300 border border-muted/30 hover:border-muted/50 hover:shadow-lg group`} onClick={handleViewProfile}>
                <div className="relative">
                  <img src={displayEvent.organizer.image} alt={displayEvent.organizer.name} className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300`} />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>{displayEvent.organizer.name}</p>
                  {displayEvent.organizer.location && <div className={`flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground`}>
                      <MapPin className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      <span>{displayEvent.organizer.location}</span>
                    </div>}
                </div>
                <Eye className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>}
          </div>

          {/* RSVP Section - REMOVED FROM HERE - moved to top */}

          {/* Companion Request Section - REMOVED FROM HERE - moved to top */}
        </div>
      </div>
    </div>;
};
export default EventVerticalPopup;