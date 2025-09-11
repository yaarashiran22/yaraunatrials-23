import { X, MessageCircle, Share, Heart, MapPin, Calendar, ChevronUp, ChevronDown, CheckCircle, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useItemDetails } from "@/hooks/useItemDetails";
import { useMeetupJoinRequests } from "@/hooks/useMeetupJoinRequests";
import { useEventCompanionRequests } from '@/hooks/useEventCompanionRequests';
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

  // Companion requests functionality  
  const { 
    isLookingForCompanion, 
    companionUsers, 
    loading: companionLoading, 
    toggleCompanionRequest 
  } = useEventCompanionRequests(displayItem?.id || '');

  const handleMessageUser = (userId: string) => {
    navigate(`/messages?userId=${userId}`);
    onClose();
  };
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

      <div ref={contentRef} className={`bg-gradient-to-br from-background via-background/95 to-primary/5 backdrop-blur-xl border-2 border-primary/20 rounded-3xl w-full max-w-sm ${isMobile ? 'max-h-[95vh]' : 'max-h-[85vh]'} overflow-y-auto mx-4 relative transition-all duration-300 shadow-2xl ${isDragging ? 'cursor-grabbing scale-[0.98]' : 'cursor-grab'} meetup-vertical-popup`} style={{
      transform: isDragging ? `translateY(${-scrollOffset}px)` : 'translateY(0px)',
      scrollBehavior: 'smooth'
    }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {allItems.length > 1 && <div className="text-sm font-semibold text-primary bg-card/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-primary/20 shadow-sm">
                {currentIndex + 1} / {allItems.length}
              </div>}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-primary/10 transition-all duration-200"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
          
        </div>

        {/* Enhanced Vertical Progress Indicators */}
        {allItems.length > 1 && <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10 p-2 bg-card/60 backdrop-blur-sm rounded-full border border-primary/20 shadow-lg">
            {allItems.map((_, index) => <div key={index} className={`w-2 h-6 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-gradient-to-b from-primary to-secondary shadow-md shadow-primary/30 scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`} />)}
          </div>}

        {/* Enhanced Content */}
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          {/* Enhanced Meetup Image */}
          <div className={`relative ${isMobile ? 'mb-5' : 'mb-7'} group`}>
            <div className="relative rounded-3xl overflow-hidden border-4 border-gradient-to-r from-primary/30 to-secondary/30 shadow-xl">
              <img src={displayItem.image} alt={displayItem.title} className={`w-full ${isMobile ? 'h-52' : 'h-72'} object-cover transition-transform duration-300 group-hover:scale-105`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="ghost" size="sm" className="p-2.5 rounded-full bg-card/90 backdrop-blur-md border border-white/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all duration-200 shadow-lg">
                <Heart className="h-4 w-4 hover:fill-current transition-all" />
              </Button>
            </div>
            
          </div>

          {/* Enhanced Meetup Details */}
          <div className={`${isMobile ? 'space-y-4' : 'space-y-5'}`}>
            <div className="text-center space-y-2">
              <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground ${isMobile ? 'mb-2' : 'mb-3'} leading-tight`}>{displayItem.title}</h3>
              {displayItem.price && displayItem.price !== 'Free' && 
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
                  <p className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-primary`}>{displayItem.price}</p>
                </div>
              }
              {displayItem.price === 'Free' && 
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-300 dark:border-emerald-700">
                  <p className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-emerald-700 dark:text-emerald-400`}>Free Event</p>
                </div>
              }
            </div>
            
            {displayItem.description && 
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
                <p className={`text-foreground leading-relaxed text-center ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {displayItem.description}
                </p>
              </div>
            }
            
            {/* Enhanced Meetup Location and Date */}
            {itemDetails && 
              <div className={`${isMobile ? 'space-y-3' : 'space-y-4'} ${isMobile ? 'p-4' : 'p-5'} bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20 rounded-2xl shadow-lg backdrop-blur-sm`}>
                <div className={`flex items-center gap-3 ${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground`}>
                  <div className="p-2 rounded-full bg-primary/20 border border-primary/30">
                    <MapPin className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
                  </div>
                  <span>{locationMapping[itemDetails.location] || itemDetails.location || 'Location TBD'}</span>
                </div>
                <div className={`flex items-center gap-3 ${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground`}>
                  <div className="p-2 rounded-full bg-secondary/20 border border-secondary/30">
                    <Calendar className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-secondary-foreground`} />
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
              </div>
            }

            {/* Enhanced Organizer Info */}
            {displayItem.seller && 
              <div className={`flex items-center gap-4 ${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-r from-card/60 to-muted/30 border border-border/50 rounded-2xl cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 group`} onClick={handleViewProfile}>
                <div className="relative">
                  <img src={displayItem.seller.image} alt={displayItem.seller.name} className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-colors`} />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background"></div>
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-foreground ${isMobile ? 'text-sm' : 'text-base'} group-hover:text-primary transition-colors`}>{displayItem.seller.name}</p>
                  <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                    <MapPin className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-primary/60`} />
                    <span>{(displayItem as any).neighborhood || displayItem.seller.location}</span>
                  </div>
                </div>
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <ChevronUp className="h-4 w-4 text-primary rotate-90" />
                </div>
              </div>
            }
          </div>

          {/* Enhanced Companion Request Section */}
          <div className="text-center space-y-4">
            <Button
              onClick={toggleCompanionRequest}
              disabled={companionLoading}
              variant={isLookingForCompanion ? "default" : "outline"}
              className={`${isMobile ? 'h-12 px-8' : 'h-14 px-10'} rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105 shadow-xl border-2 ${
                isLookingForCompanion 
                  ? 'bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-primary/30' 
                  : 'bg-gradient-to-r from-card to-background hover:from-primary/10 hover:to-secondary/10 text-primary border-primary/30 hover:border-primary/60 shadow-lg hover:shadow-xl'
              }`}
            >
              {companionLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
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
                      className="flex items-center gap-2 px-3 py-1 bg-blue-50/80 dark:bg-blue-950/30 rounded-full cursor-pointer hover:bg-blue-100/80 dark:hover:bg-blue-950/50 transition-all duration-200 hover:scale-105 shadow-sm border border-blue-200/50 dark:border-blue-800/50"
                      onClick={() => handleMessageUser(companionUser.id)}
                    >
                      <img
                        src={companionUser.profile_image_url || '/placeholder.svg'}
                        alt={companionUser.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        {companionUser.name.split(' ')[0]}
                      </span>
                      <MessageCircle className="h-3 w-3 text-blue-600" />
                    </div>
                  ))}
                  {companionUsers.length > 3 && (
                    <div className="flex items-center justify-center w-8 h-6 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                        +{companionUsers.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Join Request Section */}
          <div className={`${isMobile ? 'mt-6' : 'mt-8'} ${isMobile ? 'p-4' : 'p-5'} bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20 rounded-2xl shadow-lg backdrop-blur-sm`}>
            {joinStatus === 'approved' ? 
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                  </div>
                  <span className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>You're Joined!</span>
                </div>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  You're part of this meetup. Looking forward to seeing you there!
                </p>
              </div> 
            : joinStatus === 'pending' ? 
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3 text-amber-600 dark:text-amber-400">
                  <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Clock className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} animate-pulse`} />
                  </div>
                  <span className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>Request Pending</span>
                </div>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                  Waiting for organizer approval...
                </p>
              </div> 
            : 
              <Button 
                onClick={handleContact} 
                className={`w-full ${isMobile ? 'h-12' : 'h-14'} bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-primary-foreground rounded-2xl ${isMobile ? 'text-base' : 'text-lg'} font-bold shadow-xl transition-all duration-300 hover:scale-105`}
              >
                <MessageCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
                Request to Join
              </Button>
            }
          </div>
        </div>
      </div>
    </div>;
};
export default MeetupVerticalPopup;