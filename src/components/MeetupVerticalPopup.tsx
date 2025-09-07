import { X, MessageCircle, Share, Heart, MapPin, Calendar, ChevronUp, ChevronDown, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useItemDetails } from "@/hooks/useItemDetails";
import { useMeetupJoinRequests } from "@/hooks/useMeetupJoinRequests";
import { useState, useRef, useCallback, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

// Location mapping from English to Spanish (Buenos Aires neighborhoods)
const locationMapping: Record<string, string> = {
  'palermo': 'Palermo',
  'san-telmo': 'San Telmo',
  'recoleta': 'Recoleta',
  'puerto-madero': 'Puerto Madero',
  'belgrano': 'Belgrano',
  'villa-crespo': 'Villa Crespo'
};
interface MeetupVerticalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  item?: {
    id?: string;
    title: string;
    image: string;
    price: string;
    description?: string;
    neighborhood?: string;
    seller?: {
      id?: string;
      name: string;
      image: string;
      location: string;
    };
    condition?: string;
    type?: string;
    allItems?: any[];
    currentIndex?: number;
  };
}
const MeetupVerticalPopup = ({
  isOpen,
  onClose,
  item
}: MeetupVerticalPopupProps) => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const isMobile = useIsMobile();
  const {
    submitJoinRequest,
    checkJoinStatus
  } = useMeetupJoinRequests();
  const [joinStatus, setJoinStatus] = useState<string | null>(null);

  // Navigation state
  const allItems = item?.allItems || [];
  const currentIndex = item?.currentIndex || 0;

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
    if (currentIndex > 0 && allItems.length > 0) {
      const prevItem = allItems[currentIndex - 1];
      if (prevItem) {
        const newItem = {
          ...item,
          id: prevItem.id,
          title: prevItem.title,
          image: prevItem.image_url || prevItem.image,
          price: prevItem.price ? `₪${prevItem.price}` : undefined,
          description: prevItem.description || `${prevItem.title} - Join this meetup!`,
          currentIndex: currentIndex - 1
        };
        onClose();
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigateToMeetup', {
            detail: newItem
          }));
        }, 100);
      }
    }
  }, [currentIndex, allItems, item, onClose]);
  const handleNext = useCallback(() => {
    if (currentIndex < allItems.length - 1 && allItems.length > 0) {
      const nextItem = allItems[currentIndex + 1];
      if (nextItem) {
        const newItem = {
          ...item,
          id: nextItem.id,
          title: nextItem.title,
          image: nextItem.image_url || nextItem.image,
          price: nextItem.price ? `₪${nextItem.price}` : undefined,
          description: nextItem.description || `${nextItem.title} - Join this meetup!`,
          currentIndex: currentIndex + 1
        };
        onClose();
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigateToMeetup', {
            detail: newItem
          }));
        }, 100);
      }
    }
  }, [currentIndex, allItems, item, onClose]);

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
    if (isUpSwipe && currentIndex < allItems.length - 1) {
      handleNext();
    } else if (isDownSwipe && currentIndex > 0) {
      handlePrevious();
    }
  }, [touchStartY, touchEndY, currentIndex, allItems.length, minScrollDistance, handleNext, handlePrevious]);

  // Check join status when item changes
  useEffect(() => {
    if (item?.id && user) {
      checkJoinStatus(item.id).then(status => {
        setJoinStatus(status);
      });
    }
  }, [item?.id, user, checkJoinStatus]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowDown' && currentIndex < allItems.length - 1) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, allItems.length, handlePrevious, handleNext]);

  // Fetch item details
  const {
    item: itemDetails,
    loading: itemLoading
  } = useItemDetails(item?.id || "");
  const hasItemData = item && item.title && item.image;
  if (itemLoading && !hasItemData && item?.id) {
    return <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl w-full max-w-sm p-8 mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-foreground">Loading meetup details...</p>
          </div>
        </div>
      </div>;
  }
  const defaultItem = {
    id: "1",
    title: "Coffee Meetup",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
    price: "Free",
    description: "Join us for a casual coffee meetup and networking session.",
    seller: {
      id: "default",
      name: "Community Organizer",
      image: "https://images.unsplash.com/photo-1494790108755-2616b66dfd8d?w=100&h=100&fit=crop",
      location: "Tel Aviv"
    },
    condition: "Active"
  };
  const displayItem = itemDetails ? {
    id: itemDetails.id,
    title: itemDetails.title,
    image: itemDetails.image_url || item?.image || defaultItem.image,
    price: itemDetails.price ? `₪${itemDetails.price}` : item?.price || defaultItem.price,
    description: itemDetails.description || item?.description || defaultItem.description,
    seller: {
      id: itemDetails.uploader.id,
      name: itemDetails.uploader.name || "Organizer",
      image: itemDetails.uploader.profile_image_url || defaultItem.seller.image,
      location: itemDetails.uploader.location || "Not specified"
    },
    condition: item?.condition || defaultItem.condition
  } : item || defaultItem;
  const handleContact = async () => {
    if (!item?.id) return;
    const success = await submitJoinRequest(item.id);
    if (success) {
      setJoinStatus('pending');
    }
  };
  const handleShare = () => {
    toast({
      title: "Shared Successfully!",
      description: "Meetup shared on social networks"
    });
  };
  const handleViewProfile = () => {
    if (displayItem.seller?.id) {
      navigate(`/profile/${displayItem.seller.id}`);
      onClose();
    }
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" ref={containerRef}>
      {/* Up Navigation Button */}
      {allItems.length > 1 && currentIndex > 0 && <Button variant="ghost" size="lg" onClick={handlePrevious} className="absolute top-8 left-1/2 -translate-x-1/2 z-10 bg-white/90 hover:bg-white text-foreground shadow-lg rounded-full p-3 h-12 w-12">
          <ChevronUp className="h-6 w-6" />
        </Button>}
      
      {/* Down Navigation Button */}
      {allItems.length > 1 && currentIndex < allItems.length - 1 && <Button variant="ghost" size="lg" onClick={handleNext} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/90 hover:bg-white text-foreground shadow-lg rounded-full p-3 h-12 w-12">
          <ChevronDown className="h-6 w-6" />
        </Button>}

      <div ref={contentRef} className={`bg-purple-100/80 dark:bg-purple-900/40 rounded-2xl w-full max-w-sm ${isMobile ? 'max-h-[95vh]' : 'max-h-[85vh]'} overflow-y-auto mx-4 relative transition-transform duration-200 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} meetup-vertical-popup`} style={{
      transform: isDragging ? `translateY(${-scrollOffset}px)` : 'translateY(0px)',
      scrollBehavior: 'smooth'
    }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <div className="flex items-center gap-2">
            {allItems.length > 1 && <div className="text-sm text-muted-foreground bg-white/80 dark:bg-black/20 px-3 py-1 rounded-full">
                {currentIndex + 1} / {allItems.length}
              </div>}
          </div>
          
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          
        </div>

        {/* Vertical Navigation Instructions */}
        {allItems.length > 1 && <div className="flex justify-center py-2 border-b bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              
            </div>
          </div>}

        {/* Vertical Progress Indicators */}
        {allItems.length > 1 && <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
            {allItems.map((_, index) => <div key={index} className={`w-2 h-8 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary shadow-sm scale-110' : 'bg-muted-foreground/20'}`} />)}
          </div>}

        {/* Content */}
        <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
          {/* Meetup Image */}
          <div className={`relative ${isMobile ? 'mb-4' : 'mb-6'}`}>
            <div className="border-4 border-gradient-to-r from-blue-400 to-purple-400 rounded-2xl overflow-hidden">
              <img src={displayItem.image} alt={displayItem.title} className={`w-full ${isMobile ? 'h-48' : 'h-64'} object-cover`} />
            </div>
            
            <div className="absolute top-3 right-3">
              <Button variant="ghost" size="sm" className="p-2 rounded-full bg-card/80 backdrop-blur-sm text-red-500">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Meetup Badge */}
            <div className="absolute top-3 left-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Meetup
              </div>
            </div>
          </div>

          {/* Meetup Details */}
          <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            <div className="text-center">
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground ${isMobile ? 'mb-1' : 'mb-2'}`}>{displayItem.title}</h3>
              {displayItem.price && displayItem.price !== 'Free' && <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-primary`}>{displayItem.price}</p>}
              {displayItem.price === 'Free' && <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-green-600 dark:text-green-400`}>Free Event</p>}
            </div>
            
            {displayItem.description && <p className={`text-foreground leading-relaxed text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {displayItem.description}
              </p>}
            
            {/* Meetup Location and Date */}
            {itemDetails && <div className={`${isMobile ? 'space-y-2' : 'space-y-3'} ${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-purple-800`}>
                <div className={`flex items-center gap-3 ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>
                  <MapPin className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-600 dark:text-blue-400`} />
                  <span>{locationMapping[itemDetails.location] || itemDetails.location || 'Location TBD'}</span>
                </div>
                <div className={`flex items-center gap-3 ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>
                  <Calendar className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-600 dark:text-blue-400`} />
                  <span>
                    {new Date(itemDetails.created_at).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                  </span>
                </div>
              </div>}

            {/* Organizer Info */}
            {displayItem.seller && <div className={`flex items-center gap-3 ${isMobile ? 'p-2' : 'p-3'} bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors`} onClick={handleViewProfile}>
                <img src={displayItem.seller.image} alt={displayItem.seller.name} className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover`} />
                <div className="flex-1">
                  <p className={`font-semibold text-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>{displayItem.seller.name}</p>
                  <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                    <MapPin className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                    <span>{(displayItem as any).neighborhood || displayItem.seller.location}</span>
                  </div>
                </div>
              </div>}
          </div>

          {/* Join Request Section */}
          <div className={`${isMobile ? 'mt-4' : 'mt-6'} ${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-purple-800`}>
            
            {joinStatus === 'approved' ? <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
                  <CheckCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>Join Meetup</span>
                </div>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  You're part of this meetup
                </p>
              </div> : joinStatus === 'pending' ? <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                  <Clock className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>Request Pending</span>
                </div>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Waiting for organizer approval
                </p>
              </div> : <>
                
                <Button onClick={handleContact} className={`w-full ${isMobile ? 'h-10' : 'h-11'} bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  <MessageCircle className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                  Request to Join
                </Button>
              </>}
          </div>
        </div>
      </div>
    </div>;
};
export default MeetupVerticalPopup;