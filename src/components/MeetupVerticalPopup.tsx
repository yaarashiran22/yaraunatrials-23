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

      <div ref={contentRef} className={`backdrop-blur-xl bg-gradient-to-br from-cyan-50/95 via-blue-50/95 to-indigo-50/95 dark:from-cyan-950/95 dark:via-blue-950/95 dark:to-indigo-950/95 rounded-3xl border border-white/20 shadow-2xl w-full max-w-sm ${isMobile ? 'max-h-[95vh]' : 'max-h-[85vh]'} overflow-y-auto mx-4 relative transition-transform duration-300 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} meetup-vertical-popup`} style={{
      transform: isDragging ? `translateY(${-scrollOffset}px)` : 'translateY(0px)',
      scrollBehavior: 'smooth'
    }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {allItems.length > 1 && <div className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm border border-white/30">
                {currentIndex + 1} / {allItems.length}
              </div>}
          </div>
          
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/20 transition-all duration-300 rounded-full p-2">
            <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Button>
          
        </div>

        {/* Vertical Navigation Instructions */}
        {allItems.length > 1 && <div className="flex justify-center py-3 border-b border-white/10 bg-gradient-to-r from-cyan-400/5 via-blue-400/5 to-indigo-400/5">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 px-4 py-1 rounded-full bg-white/30 dark:bg-black/20 backdrop-blur-sm">
              
            </div>
          </div>}

        {/* Vertical Progress Indicators */}
        {allItems.length > 1 && <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
            {allItems.map((_, index) => <div key={index} className={`w-3 h-10 rounded-full transition-all duration-500 backdrop-blur-sm border border-white/20 ${index === currentIndex ? 'bg-gradient-to-b from-cyan-400 to-blue-400 shadow-lg shadow-cyan-400/40 scale-110' : 'bg-white/20 dark:bg-black/20'}`} />)}
          </div>}

        {/* Content */}
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          {/* Meetup Image */}
          <div className={`relative ${isMobile ? 'mb-6' : 'mb-8'}`}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 z-10"></div>
              <img src={displayItem.image} alt={displayItem.title} className={`w-full ${isMobile ? 'h-56' : 'h-72'} object-cover`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"></div>
            </div>
            
            <div className="absolute top-4 right-4 z-20">
              <Button variant="ghost" size="sm" className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-red-400 hover:bg-white/30 transition-all duration-300 shadow-lg">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Meetup Badge */}
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                🤝 Meetup
              </div>
            </div>
          </div>

          {/* Meetup Details */}
          <div className={`${isMobile ? 'space-y-5' : 'space-y-6'}`}>
            <div className="text-center">
              <h3 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent ${isMobile ? 'mb-2' : 'mb-3'} leading-tight`} style={{ fontFamily: 'Playfair Display, serif' }}>{displayItem.title}</h3>
              {displayItem.price && displayItem.price !== 'Free' && <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-cyan-600 dark:text-cyan-400`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{displayItem.price}</p>}
              {displayItem.price === 'Free' && <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-emerald-500 dark:text-emerald-400`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>🎉 Free Meetup</p>}
            </div>
            
            {displayItem.description && <p className={`text-gray-600 dark:text-gray-300 leading-relaxed text-center ${isMobile ? 'text-sm' : 'text-base'} px-2`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {displayItem.description}
              </p>}
            
            {/* Meetup Location and Date */}
            {itemDetails && <div className={`${isMobile ? 'space-y-3' : 'space-y-4'} ${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-cyan-50/70 via-blue-50/70 to-indigo-50/70 dark:from-cyan-950/50 dark:via-blue-950/50 dark:to-indigo-950/50 rounded-2xl border border-white/30 backdrop-blur-sm shadow-lg`}>
                <div className={`flex items-center gap-4 ${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-700 dark:text-gray-300`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="p-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400">
                    <MapPin className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
                  </div>
                  <span>{locationMapping[itemDetails.location] || itemDetails.location || 'Location TBD'}</span>
                </div>
                <div className={`flex items-center gap-4 ${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-700 dark:text-gray-300`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400">
                    <Calendar className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
                  </div>
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
            {displayItem.seller && <div className={`flex items-center gap-4 ${isMobile ? 'p-4' : 'p-5'} bg-white/40 dark:bg-black/20 rounded-2xl cursor-pointer hover:bg-white/60 dark:hover:bg-black/30 transition-all duration-300 backdrop-blur-sm border border-white/30 shadow-lg`} onClick={handleViewProfile}>
                <div className="relative">
                  <img src={displayItem.seller.image} alt={displayItem.seller.name} className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-full object-cover border-2 border-white shadow-lg`} />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-gray-800 dark:text-gray-200 ${isMobile ? 'text-sm' : 'text-base'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{displayItem.seller.name}</p>
                  <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400 mt-1`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    <MapPin className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span>{(displayItem as any).neighborhood || displayItem.seller.location}</span>
                  </div>
                </div>
              </div>}
          </div>

          {/* Join Request Section */}
          <div className={`${isMobile ? 'mt-6' : 'mt-8'} ${isMobile ? 'p-5' : 'p-6'} bg-gradient-to-br from-cyan-50/70 via-blue-50/70 to-indigo-50/70 dark:from-cyan-950/50 dark:via-blue-950/50 dark:to-indigo-950/50 rounded-2xl border border-white/30 backdrop-blur-sm shadow-xl`}>
            
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
                
                <Button onClick={handleContact} className={`w-full ${isMobile ? 'h-12' : 'h-14'} bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 text-white rounded-2xl ${isMobile ? 'text-base' : 'text-lg'} font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <MessageCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-3`} />
                  🤝 Request to Join
                </Button>
              </>}
          </div>
        </div>
      </div>
    </div>;
};
export default MeetupVerticalPopup;