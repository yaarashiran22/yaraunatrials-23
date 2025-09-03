import { X, MessageCircle, Share, Heart, MapPin, Calendar, ChevronUp, ChevronDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useCallback, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" ref={containerRef}>
      {/* Up Navigation Button */}
      {allEvents.length > 1 && currentIndex > 0 && <Button variant="ghost" size="lg" onClick={handlePrevious} className="absolute top-8 left-1/2 -translate-x-1/2 z-10 bg-white/90 hover:bg-white text-foreground shadow-lg rounded-full p-3 h-12 w-12">
          <ChevronUp className="h-6 w-6" />
        </Button>}
      
      {/* Down Navigation Button */}
      {allEvents.length > 1 && currentIndex < allEvents.length - 1 && <Button variant="ghost" size="lg" onClick={handleNext} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/90 hover:bg-white text-foreground shadow-lg rounded-full p-3 h-12 w-12">
          <ChevronDown className="h-6 w-6" />
        </Button>}

      <div ref={contentRef} className={`backdrop-blur-xl bg-gradient-to-br from-emerald-50/95 via-green-50/95 to-teal-50/95 dark:from-emerald-950/95 dark:via-green-950/95 dark:to-teal-950/95 rounded-3xl border border-white/20 shadow-2xl w-full max-w-sm ${isMobile ? 'max-h-[95vh]' : 'max-h-[85vh]'} overflow-y-auto mx-4 relative transition-transform duration-300 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} event-vertical-popup`} style={{
      transform: isDragging ? `translateY(${-scrollOffset}px)` : 'translateY(0px)',
      scrollBehavior: 'smooth'
    }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 backdrop-blur-sm">
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/20 transition-all duration-300 rounded-full p-2">
            <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Button>
          
          <div className="flex items-center gap-3">
            {allEvents.length > 1 && <div className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm border border-white/30">
                {currentIndex + 1} / {allEvents.length}
              </div>}
          </div>
        </div>

        {/* Vertical Navigation Instructions */}
        {allEvents.length > 1 && <div className="flex justify-center py-3 border-b border-white/10 bg-gradient-to-r from-emerald-400/5 via-green-400/5 to-teal-400/5">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 px-4 py-1 rounded-full bg-white/30 dark:bg-black/20 backdrop-blur-sm">
              
            </div>
          </div>}

        {/* Vertical Progress Indicators */}
        {allEvents.length > 1 && <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
            {allEvents.map((_, index) => <div key={index} className={`w-3 h-10 rounded-full transition-all duration-500 backdrop-blur-sm border border-white/20 ${index === currentIndex ? 'bg-gradient-to-b from-emerald-400 to-green-400 shadow-lg shadow-emerald-400/40 scale-110' : 'bg-white/20 dark:bg-black/20'}`} />)}
          </div>}

        {/* Content */}
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          {/* Event Image */}
          <div className={`relative ${isMobile ? 'mb-6' : 'mb-8'}`}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 z-10"></div>
              <img src={displayEvent.image} alt={displayEvent.title} className={`w-full ${isMobile ? 'h-56' : 'h-72'} object-cover`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"></div>
            </div>
            
            <div className="absolute top-4 right-4 z-20">
              <Button variant="ghost" size="sm" className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-red-400 hover:bg-white/30 transition-all duration-300 shadow-lg">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Event Badge */}
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                ✨ Event
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className={`${isMobile ? 'space-y-5' : 'space-y-6'}`}>
            <div className="text-center">
              <h3 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent ${isMobile ? 'mb-2' : 'mb-3'} leading-tight`} style={{ fontFamily: 'Playfair Display, serif' }}>{displayEvent.title}</h3>
              {displayEvent.price && displayEvent.price !== 'Free' && <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-emerald-600 dark:text-emerald-400`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{displayEvent.price}</p>}
              {(!displayEvent.price || displayEvent.price === 'Free') && <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-emerald-500 dark:text-emerald-400`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>✨ Free Event</p>}
            </div>
            
            {displayEvent.description && <p className={`text-gray-600 dark:text-gray-300 leading-relaxed text-center ${isMobile ? 'text-sm' : 'text-base'} px-2`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {displayEvent.description}
              </p>}
            
            {/* Event Details Section */}
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'} ${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-emerald-50/70 via-green-50/70 to-teal-50/70 dark:from-emerald-950/50 dark:via-green-950/50 dark:to-teal-950/50 rounded-2xl border border-white/30 backdrop-blur-sm shadow-lg`}>
              {displayEvent.location && <div className={`flex items-center gap-4 ${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-700 dark:text-gray-300`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="p-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-400">
                    <MapPin className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
                  </div>
                  <span>{locationMapping[displayEvent.location] || displayEvent.location}</span>
                </div>}
              
              {displayEvent.date && <div className={`flex items-center gap-4 ${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-700 dark:text-gray-300`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="p-2 rounded-full bg-gradient-to-r from-green-400 to-teal-400">
                    <Calendar className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
                  </div>
                  <span>
                    {new Date(displayEvent.date).toLocaleDateString('en-US', {
                  weekday: isMobile ? 'short' : 'long',
                  year: 'numeric',
                  month: isMobile ? 'short' : 'long',
                  day: 'numeric'
                })}
                  </span>
                </div>}
              
              {displayEvent.time && <div className={`flex items-center gap-4 ${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-700 dark:text-gray-300`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="p-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400">
                    <Clock className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
                  </div>
                  <span>{displayEvent.time ? displayEvent.time.slice(0, 5) : ''}</span>
                </div>}
            </div>

            {/* Organizer Info */}
            {displayEvent.organizer && <div className={`flex items-center gap-4 ${isMobile ? 'p-4' : 'p-5'} bg-white/40 dark:bg-black/20 rounded-2xl cursor-pointer hover:bg-white/60 dark:hover:bg-black/30 transition-all duration-300 backdrop-blur-sm border border-white/30 shadow-lg`} onClick={handleViewProfile}>
                <div className="relative">
                  <img src={displayEvent.organizer.image} alt={displayEvent.organizer.name} className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-full object-cover border-2 border-white shadow-lg`} />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-gray-800 dark:text-gray-200 ${isMobile ? 'text-sm' : 'text-base'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{displayEvent.organizer.name}</p>
                  {displayEvent.organizer.location && <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400 mt-1`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      <MapPin className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      <span>{displayEvent.organizer.location}</span>
                    </div>}
                </div>
              </div>}
          </div>

          {/* RSVP Section */}
          <div className={`${isMobile ? 'mt-6' : 'mt-8'} ${isMobile ? 'p-5' : 'p-6'} bg-gradient-to-br from-emerald-50/70 via-green-50/70 to-teal-50/70 dark:from-emerald-950/50 dark:via-green-950/50 dark:to-teal-950/50 rounded-2xl border border-white/30 backdrop-blur-sm shadow-xl`}>
            
            
            <Button onClick={handleRSVP} className={`w-full ${isMobile ? 'h-12' : 'h-14'} bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white rounded-2xl ${isMobile ? 'text-base' : 'text-lg'} font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <MessageCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-3`} />
              ✨ RSVP for Event
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default EventVerticalPopup;