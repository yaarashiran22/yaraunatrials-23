import { X, MessageCircle, Share, Heart, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface EventPopupProps {
  isOpen: boolean;
  onClose: () => void;
  event?: {
    id?: string;
    title: string;
    image: string;
    price: string;
    description: string;
    organizer?: {
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
  event
}: EventPopupProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const defaultEvent = {
    id: "1",
    title: "מסיבת בהרדר",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=600&fit=crop",
    price: "100 ₪",
    description: "מסיבה לציון אפרטהוף במסגרת שב הרדי שכולנו רוצים לו יהיה על הטט",
    organizer: {
      name: "יערה שיין",
      image: "https://images.unsplash.com/photo-1494790108755-2616b66dfd8d?w=100&h=100&fit=crop",
      location: "תל אביב"
    },
    date: "15 בדצמבר"
  };

  const eventData = event || defaultEvent;
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
    navigate(`/event/${eventData.id}`);
    onClose();
  };
  if (!isOpen) return null;

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
          
          <h2 className="text-lg font-bold text-foreground">{eventData.title}</h2>
          
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
                src={eventData.image}
                alt={eventData.title}
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
              <h3 className="text-2xl font-bold text-foreground mb-2">{eventData.price}</h3>
              <p className="text-lg font-semibold text-foreground">{eventData.title}</p>
              {eventData.date && (
                <p className="text-sm text-primary">תאריך: {eventData.date}</p>
              )}
            </div>
            
            <p className="text-foreground leading-relaxed text-center">
              {eventData.description}
            </p>
            
            {/* Organizer Info */}
            {eventData.organizer && (
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <img 
                  src={eventData.organizer.image}
                  alt={eventData.organizer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{eventData.organizer.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{eventData.organizer.location}</span>
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
              צור קשר
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