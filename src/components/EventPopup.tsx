import { X, MessageCircle, Share, Bookmark, MapPin, Eye, Check, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useItemDetails } from "@/hooks/useItemDetails";
import { useEventRSVP } from "@/hooks/useEventRSVP";
import { useEventCompanionRequests } from "@/hooks/useEventCompanionRequests";
import { getRelativeDay } from "@/utils/dateUtils";
import profile1 from "@/assets/profile-1.jpg";
import { useIsMobile } from "@/hooks/use-mobile";

interface EventPopupProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  event?: {
    id?: string;
    title: string;
    image: string;
    video?: string;
    price?: string;
    description: string;
    organizer?: {
      id?: string;
      name: string;
      image: string;
      location: string;
    };
    date?: string;
  };
}
const EventPopup = ({
  isOpen,
  onClose,
  eventId,
  event
}: EventPopupProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Always show UI immediately with passed event data
  // Only fetch additional details if we need mobile_number or other specific data AND have a valid ID
  const needsAdditionalData = !event?.organizer?.id && eventId && eventId !== "1";
  const { item: eventData, loading } = useItemDetails(needsAdditionalData ? eventId : '');

  const defaultEvent = {
    id: undefined,
    title: "Event Party",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=600&fit=crop",
    video: undefined,
    price: "₪100",
    description: "Join us for an amazing party celebration with great music and good vibes",
    organizer: {
      id: undefined,
      name: "Sarah Cohen",
      image: "https://images.unsplash.com/photo-1494790108755-2616b66dfd8d?w=100&h=100&fit=crop",
      location: "Tel Aviv"
    },
    date: "December 15"
  };

  // Use real data if available, otherwise fallback to passed event or default
  const displayEvent = eventData ? {
    id: eventData.id,
    title: eventData.title,
    image: eventData.image_url || defaultEvent.image,
    video: (eventData as any).video_url, // Type assertion for video_url
    price: eventData.price ? `₪${eventData.price}` : defaultEvent.price,
    description: eventData.description || defaultEvent.description,
    organizer: {
      id: eventData.uploader?.id,
      name: eventData.uploader?.name || "User",
      image: eventData.uploader?.profile_image_url || 
             eventData.uploader?.small_profile_photo || 
             profile1,
      location: eventData.uploader?.location || "Not specified"
    },
    date: eventData.created_at ? new Date(eventData.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : null
  } : (event || defaultEvent);
  
  // RSVP functionality - only enable if we have a valid event ID
  const validEventId = eventId || (displayEvent.id && displayEvent.id !== "1" ? displayEvent.id : undefined);
  const { userRSVP, rsvpCount, handleRSVP, isUpdating } = useEventRSVP(validEventId || '');
  
  // Companion requests functionality
  const { 
    isLookingForCompanion, 
    companionUsers, 
    loading: companionLoading, 
    toggleCompanionRequest 
  } = useEventCompanionRequests(validEventId || '');

  console.log('EventPopup - eventData:', eventData);
  console.log('EventPopup - mobile_number:', eventData?.mobile_number);

  const handleViewProfile = () => {
    if (displayEvent.organizer?.id) {
      navigate(`/profile/${displayEvent.organizer.id}`);
      onClose();
    }
  };

  const handleContact = () => {
    const mobileNumber = eventData?.mobile_number;
    if (mobileNumber) {
      // Create WhatsApp link
      const whatsappUrl = `https://wa.me/${mobileNumber.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in your event: ${encodeURIComponent(displayEvent.title)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      toast({
        title: "Contact Unavailable",
        description: "No contact information available for this event",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayEvent.title,
        text: displayEvent.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      toast({
        title: "Shared Successfully!",
        description: "Event has been shared"
      });
    }
  };

  const handleViewDetails = () => {
    navigate(`/event/${displayEvent.id}`);
    onClose();
  };

  const handleMessageUser = (userId: string) => {
    navigate(`/messages?userId=${userId}`);
    onClose();
  };

  if (!isOpen) return null;

  // Show immediate UI with passed data, no loading screen needed unless we're fetching additional data
  const showLoadingState = needsAdditionalData && loading && !event;

  if (showLoadingState) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto mx-4">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="w-6 h-6 bg-muted rounded animate-pulse"></div>
            <div className="w-32 h-6 bg-muted rounded animate-pulse"></div>
            <div className="w-6 h-6 bg-muted rounded animate-pulse"></div>
          </div>
          
          {/* Content Skeleton */}
          <div className="p-4">
            <div className="w-full h-64 bg-muted rounded-2xl animate-pulse mb-6"></div>
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-24 h-8 bg-muted rounded mx-auto animate-pulse"></div>
                <div className="w-48 h-6 bg-muted rounded mx-auto animate-pulse"></div>
                <div className="w-32 h-4 bg-muted rounded mx-auto animate-pulse"></div>
              </div>
              <div className="w-full h-16 bg-muted rounded animate-pulse"></div>
              <div className="w-full h-16 bg-muted rounded animate-pulse"></div>
              <div className="space-y-3">
                <div className="w-full h-12 bg-muted rounded-2xl animate-pulse"></div>
                <div className="w-full h-12 bg-muted rounded-2xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className={`bg-background rounded-2xl w-full max-w-sm ${isMobile ? 'max-h-[95vh]' : 'max-h-[90vh]'} overflow-y-auto mx-4`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <h2 className="text-lg font-bold text-foreground">{displayEvent.title}</h2>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleShare}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
          {/* Event Media */}
          <div className={`relative ${isMobile ? 'mb-4' : 'mb-6'}`}>
            <div className="border-4 border-yellow-400 rounded-2xl overflow-hidden">
              {displayEvent.video ? (
                <video 
                  src={displayEvent.video}
                  className={`w-full ${isMobile ? 'h-48' : 'h-64'} object-cover`}
                  controls
                  poster={displayEvent.image}
                  preload="metadata"
                  onError={(e) => {
                    console.log('Video failed to load, showing fallback image');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <img 
                  src={displayEvent.image}
                  alt={displayEvent.title}
                  className={`w-full ${isMobile ? 'h-48' : 'h-64'} object-cover`}
                />
              )}
            </div>
            
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-full bg-card/80 backdrop-blur-sm text-red-500"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Event Details */}
          <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            <div className="text-center">
              {eventData?.price && (
                <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground ${isMobile ? 'mb-1' : 'mb-2'}`}>{displayEvent.price}</h3>
              )}
              <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-foreground`}>{displayEvent.title}</p>
              {displayEvent.date && (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-primary`}>Date: {getRelativeDay(displayEvent.date)}</p>
              )}
            </div>
            
            <p className={`text-foreground leading-relaxed text-center ${isMobile ? 'text-xs' : ''}`}>
              {displayEvent.description}
            </p>
            
            {/* Organizer Info */}
            {displayEvent.organizer && (
              <div 
                className={`flex items-center gap-3 ${isMobile ? 'p-3' : 'p-4'} bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors`}
                onClick={handleViewProfile}
              >
                <img 
                  src={displayEvent.organizer.image || profile1}
                  alt={displayEvent.organizer.name}
                  className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full object-cover`}
                  onError={(e) => {
                    console.log('Profile image failed to load, using fallback. Original src:', e.currentTarget.src);
                    e.currentTarget.src = profile1;
                  }}
                />
                <div className="flex-1">
                  <p className={`font-semibold text-foreground ${isMobile ? 'text-sm' : ''}`}>{displayEvent.organizer.name}</p>
                  <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                    <MapPin className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span>{displayEvent.organizer.location}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RSVP Section - only show if we have a valid event ID */}
          {validEventId && (
            <div className={`${isMobile ? 'mt-4' : 'mt-6'} ${isMobile ? 'p-3' : 'p-4'} bg-muted/20 rounded-xl`}>
              <div className={`text-center ${isMobile ? 'mb-3' : 'mb-4'}`}>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground ${isMobile ? 'mb-1' : 'mb-2'}`}>
                  {rsvpCount} people attending
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => handleRSVP('going')}
                    disabled={isUpdating}
                    variant={userRSVP?.status === 'going' ? "default" : "outline"}
                    className={`flex-1 ${isMobile ? 'h-8' : 'h-10'} rounded-lg ${isMobile ? 'text-xs' : ''}`}
                  >
                    <Check className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                    Going
                  </Button>
                  <Button
                    onClick={() => handleRSVP('maybe')}
                    disabled={isUpdating}
                    variant={userRSVP?.status === 'maybe' ? "secondary" : "outline"}
                    className={`flex-1 ${isMobile ? 'h-8' : 'h-10'} rounded-lg ${isMobile ? 'text-xs' : ''}`}
                  >
                    <UserCheck className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                    Maybe
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Companion Request Section */}
          {validEventId && (
            <div className={`${isMobile ? 'mt-4' : 'mt-6'} ${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-800`}>
              <div className={`text-center ${isMobile ? 'mb-3' : 'mb-4'}`}>
                <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground mb-2`}>
                  Looking for someone to join?
                </h4>
                <Button
                  onClick={toggleCompanionRequest}
                  disabled={companionLoading}
                  variant={isLookingForCompanion ? "default" : "outline"}
                  className={`w-full ${isMobile ? 'h-10' : 'h-11'} rounded-lg ${isMobile ? 'text-sm' : ''}`}
                >
                  <Users className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
                  {isLookingForCompanion ? 'Stop looking for companion' : 'Looking for someone to join me'}
                </Button>
                
                {companionUsers.length > 0 && (
                  <div className={`${isMobile ? 'mt-3' : 'mt-4'}`}>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mb-2`}>
                      {companionUsers.length} {companionUsers.length === 1 ? 'person is' : 'people are'} looking for companions:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {companionUsers.map((companionUser) => (
                        <div
                          key={companionUser.id}
                          className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} bg-white/60 dark:bg-black/20 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-black/30 transition-colors`}
                          onClick={() => handleMessageUser(companionUser.id)}
                        >
                          <img
                            src={companionUser.profile_image_url || profile1}
                            alt={companionUser.name}
                            className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full object-cover`}
                          />
                          <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>
                            {companionUser.name}
                          </span>
                          <MessageCircle className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`${isMobile ? 'mt-4' : 'mt-6'} flex flex-col ${isMobile ? 'gap-2' : 'gap-3'}`}>
            <Button 
              onClick={handleContact}
              variant={eventData?.mobile_number ? "default" : "outline"}
              disabled={!eventData?.mobile_number}
              className={`flex-1 ${isMobile ? 'h-10' : 'h-12'} rounded-2xl ${isMobile ? 'text-base' : 'text-lg'} font-medium ${
                !eventData?.mobile_number ? 'opacity-60' : ''
              }`}
            >
              <MessageCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ml-2`} />
              {eventData?.mobile_number ? 'Contact' : 'No contact info'}
            </Button>
            <Button 
              onClick={handleViewDetails}
              className={`flex-1 ${isMobile ? 'h-10' : 'h-12'} bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl ${isMobile ? 'text-base' : 'text-lg'} font-medium`}
            >
              <Eye className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ml-2`} />
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;