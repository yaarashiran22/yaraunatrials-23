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
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={`bg-background/95 backdrop-blur-md rounded-3xl w-full max-w-sm ${isMobile ? 'max-h-[95vh]' : 'max-h-[90vh]'} overflow-y-auto mx-4 shadow-2xl border border-white/10 animate-scale-in`}>
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-b border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="relative flex items-center justify-between p-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-200 shadow-lg"
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 text-center px-4">
              <h2 className="text-xl font-bold text-foreground bg-background/40 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                {displayEvent.title}
              </h2>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleShare}
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-200 shadow-lg"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          {/* Event Media */}
          <div className={`relative ${isMobile ? 'mb-6' : 'mb-8'} group`}>
            <div className="relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
              {displayEvent.video ? (
                <video 
                  src={displayEvent.video}
                  className={`w-full ${isMobile ? 'h-56' : 'h-72'} object-cover transition-transform duration-300 group-hover:scale-105`}
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
                  className={`w-full ${isMobile ? 'h-56' : 'h-72'} object-cover transition-transform duration-300 group-hover:scale-105`}
                />
              )}
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>
            
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md text-red-500 hover:bg-background/90 hover:scale-110 transition-all duration-200 shadow-lg"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Event Details */}
          <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            <div className="text-center space-y-3">
              {eventData?.price && (
                <div className="inline-flex items-center justify-center">
                  <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent`}>
                    {displayEvent.price}
                  </span>
                </div>
              )}
              <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground leading-tight`}>
                {displayEvent.title}
              </h3>
              {displayEvent.date && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} text-primary font-medium`}>
                    {getRelativeDay(displayEvent.date)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm rounded-2xl p-5 border border-muted/50">
              <p className={`text-foreground/90 leading-relaxed text-center ${isMobile ? 'text-sm' : 'text-base'}`}>
                {displayEvent.description}
              </p>
            </div>
            
            {/* Organizer Info */}
            {displayEvent.organizer && (
              <div 
                className={`flex items-center gap-4 ${isMobile ? 'p-4' : 'p-5'} bg-gradient-to-r from-background/60 to-background/40 backdrop-blur-sm rounded-2xl cursor-pointer hover:from-background/80 hover:to-background/60 transition-all duration-300 border border-muted/30 hover:border-muted/50 hover:shadow-lg group`}
                onClick={handleViewProfile}
              >
                <div className="relative">
                  <img 
                    src={displayEvent.organizer.image || profile1}
                    alt={displayEvent.organizer.name}
                    className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300`}
                    onError={(e) => {
                      console.log('Profile image failed to load, using fallback. Original src:', e.currentTarget.src);
                      e.currentTarget.src = profile1;
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>
                    {displayEvent.organizer.name}
                  </p>
                  <div className={`flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground`}>
                    <MapPin className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span>{displayEvent.organizer.location}</span>
                  </div>
                </div>
                <Eye className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
            )}
          </div>

          {/* RSVP Section - only show if we have a valid event ID */}
          {validEventId && (
            <div className={`${isMobile ? 'mt-6' : 'mt-8'} ${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-r from-green-50/80 to-blue-50/80 dark:from-green-950/40 dark:to-blue-950/40 backdrop-blur-sm rounded-2xl border border-green-200/50 dark:border-blue-800/50`}>
              <div className={`text-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-primary`}>
                    {rsvpCount} people attending
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => handleRSVP('going')}
                    disabled={isUpdating}
                    variant={userRSVP?.status === 'going' ? "default" : "outline"}
                    className={`flex-1 ${isMobile ? 'h-11' : 'h-12'} rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg ${
                      userRSVP?.status === 'going' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                  >
                    <Check className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
                    Going
                  </Button>
                  <Button
                    onClick={() => handleRSVP('maybe')}
                    disabled={isUpdating}
                    variant={userRSVP?.status === 'maybe' ? "secondary" : "outline"}
                    className={`flex-1 ${isMobile ? 'h-11' : 'h-12'} rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg ${
                      userRSVP?.status === 'maybe' 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                    }`}
                  >
                    <UserCheck className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
                    Maybe
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Companion Request Section */}
          {validEventId && (
            <div className={`${isMobile ? 'mt-6' : 'mt-8'} ${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/40 dark:to-pink-950/40 backdrop-blur-sm rounded-2xl border border-purple-200/50 dark:border-purple-800/50`}>
              <div className={`text-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-purple-600" />
                  <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-foreground`}>
                    Looking for someone to join?
                  </h4>
                </div>
                <Button
                  onClick={toggleCompanionRequest}
                  disabled={companionLoading}
                  variant={isLookingForCompanion ? "default" : "outline"}
                  className={`w-full ${isMobile ? 'h-12' : 'h-14'} rounded-xl font-semibold text-base transition-all duration-200 hover:scale-105 shadow-lg ${
                    isLookingForCompanion 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                      : 'border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-950/30'
                  }`}
                >
                  <Users className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} mr-3`} />
                  {isLookingForCompanion ? 'Stop looking for companion' : 'Looking for someone to join me'}
                </Button>
                
                {companionUsers.length > 0 && (
                  <div className={`${isMobile ? 'mt-5' : 'mt-6'}`}>
                    <p className={`${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground mb-4 font-medium`}>
                      {companionUsers.length} {companionUsers.length === 1 ? 'person is' : 'people are'} looking for companions:
                    </p>
                    <div className="space-y-3">
                      {companionUsers.map((companionUser) => (
                        <div
                          key={companionUser.id}
                          className={`flex items-center gap-4 ${isMobile ? 'p-3' : 'p-4'} bg-white/70 dark:bg-black/30 backdrop-blur-sm rounded-xl cursor-pointer hover:bg-white/90 dark:hover:bg-black/40 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg border border-white/50`}
                          onClick={() => handleMessageUser(companionUser.id)}
                        >
                          <div className="relative">
                            <img
                              src={companionUser.profile_image_url || profile1}
                              alt={companionUser.name}
                              className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full object-cover ring-2 ring-purple-200`}
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <span className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-foreground`}>
                              {companionUser.name}
                            </span>
                            <p className="text-sm text-muted-foreground">Tap to message</p>
                          </div>
                          <MessageCircle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`${isMobile ? 'mt-6' : 'mt-8'} flex flex-col ${isMobile ? 'gap-3' : 'gap-4'}`}>
            <Button 
              onClick={handleContact}
              variant={eventData?.mobile_number ? "default" : "outline"}
              disabled={!eventData?.mobile_number}
              className={`flex-1 ${isMobile ? 'h-12' : 'h-14'} rounded-2xl ${isMobile ? 'text-base' : 'text-lg'} font-bold transition-all duration-200 hover:scale-105 shadow-lg ${
                eventData?.mobile_number 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <MessageCircle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} mr-3`} />
              {eventData?.mobile_number ? 'Contact Organizer' : 'No contact info'}
            </Button>
            <Button 
              onClick={handleViewDetails}
              className={`flex-1 ${isMobile ? 'h-12' : 'h-14'} bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-2xl ${isMobile ? 'text-base' : 'text-lg'} font-bold transition-all duration-200 hover:scale-105 shadow-lg`}
            >
              <Eye className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} mr-3`} />
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;