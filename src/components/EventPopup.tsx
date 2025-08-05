import { X, MessageCircle, Share, Heart, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useItemDetails } from "@/hooks/useItemDetails";
import profile1 from "@/assets/profile-1.jpg";

interface EventPopupProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  event?: {
    id?: string;
    title: string;
    image: string;
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
  
  // Only fetch real event data if eventId is provided and popup is open
  const shouldFetchData = isOpen && eventId && eventId !== '';
  const { item: eventData, loading } = useItemDetails(shouldFetchData ? eventId : '');

  const defaultEvent = {
    id: "1",
    title: "מסיבת בהרדר",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=600&fit=crop",
    price: "100 ₪",
    description: "מסיבה לציון אפרטהוף במסגרת שב הרדי שכולנו רוצים לו יהיה על הטט",
    organizer: {
      id: undefined,
      name: "יערה שיין",
      image: "https://images.unsplash.com/photo-1494790108755-2616b66dfd8d?w=100&h=100&fit=crop",
      location: "תל אביב"
    },
    date: "15 בדצמבר"
  };

  // Use real data if available, otherwise fallback to passed event or default
  const displayEvent = eventData ? {
    id: eventData.id,
    title: eventData.title,
    image: eventData.image_url || defaultEvent.image,
    price: eventData.price ? `₪${eventData.price}` : defaultEvent.price,
    description: eventData.description || defaultEvent.description,
    organizer: {
      id: eventData.uploader.id,
      name: eventData.uploader.name || "משתמש",
      image: eventData.uploader.profile_image_url || 
             eventData.uploader.small_profile_photo || 
             profile1,
      location: eventData.uploader.location || "לא צוין"
    },
    date: new Date(eventData.created_at).toLocaleDateString('he-IL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  } : (event || defaultEvent);

  console.log('EventPopup - eventData:', eventData);
  console.log('EventPopup - mobile_number:', eventData?.mobile_number);

  const handleViewProfile = () => {
    if (displayEvent.organizer?.id) {
      navigate(`/profile/${displayEvent.organizer.id}`);
      onClose();
    }
  };

  const handleContact = () => {
    toast({
      title: "פותח צ'אט",
      description: "מפנה לשיחה עם מארגן האירוע",
    });
  };

  const handleShare = () => {
    toast({
      title: "שותף בהצלחה!",
      description: "האירוע שותף ברשתות החברתיות"
    });
  };

  const handleViewDetails = () => {
    navigate(`/event/${displayEvent.id}`);
    onClose();
  };

  if (!isOpen) return null;

  // Show loading state
  if (shouldFetchData && loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl w-full max-w-sm p-8 text-center">
          <div className="text-muted-foreground">טוען נתונים...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto mx-4">
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
        <div className="p-4">
          {/* Event Image */}
          <div className="relative mb-6">
            <div className="border-4 border-yellow-400 rounded-2xl overflow-hidden">
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
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">{displayEvent.price}</h3>
              <p className="text-lg font-semibold text-foreground">{displayEvent.title}</p>
              {displayEvent.date && (
                <p className="text-sm text-primary">תאריך: {displayEvent.date}</p>
              )}
            </div>
            
            <p className="text-foreground leading-relaxed text-center">
              {displayEvent.description}
            </p>
            
            {/* Organizer Info */}
            {displayEvent.organizer && (
              <div 
                className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleViewProfile}
              >
                <img 
                  src={displayEvent.organizer.image || profile1}
                  alt={displayEvent.organizer.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    console.log('Profile image failed to load, using fallback. Original src:', e.currentTarget.src);
                    e.currentTarget.src = profile1;
                  }}
                />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{displayEvent.organizer.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{displayEvent.organizer.location}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <Button 
              onClick={handleContact}
              variant="outline"
              className="flex-1 h-12 rounded-2xl text-lg font-medium"
            >
              <MessageCircle className="h-5 w-5 ml-2" />
              {eventData?.mobile_number || 'צור קשר'}
            </Button>
            <Button 
              onClick={handleViewDetails}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-lg font-medium"
            >
              <Eye className="h-5 w-5 ml-2" />
              פרטים מלאים
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;