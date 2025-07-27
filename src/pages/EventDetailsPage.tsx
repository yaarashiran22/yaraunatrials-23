
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, Share, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import communityEvent from "@/assets/community-event.jpg";

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data - in a real app this would come from an API
  const eventData = {
    id: id || "1",
    title: "מסיבת בהרדר",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=600&fit=crop",
    price: "100 ₪",
    description: "מסיבה לציון אפרטהוף במסגרת שב הרדי שכולנו רוצים לו יהיה על הטט. האירוע יכלול מוזיקה, אוכל וחוויות מיוחדות.",
    instagram: "hamashbir@",
    date: "היום, 21:00",
    location: "תל אביב",
    organizer: {
      name: "יערה שיין",
      image: "https://images.unsplash.com/photo-1494790108755-2616b66dfd8d?w=100&h=100&fit=crop"
    }
  };

  const handleShare = () => {
    toast({
      title: "שותף בהצלחה!",
      description: "האירוע שותף ברשתות החברתיות",
    });
  };

  const handleJoinEvent = () => {
    toast({
      title: "הצטרפות לאירוע",
      description: "הצטרפת לאירוע בהצלחה!",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Event Image */}
        <div className="relative mb-6">
          <div className="border-4 border-yellow-400 rounded-2xl overflow-hidden">
            <img 
              src={eventData.image}
              alt={eventData.title}
              className="w-full h-80 object-cover"
            />
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-2 rounded-full bg-card/80 backdrop-blur-sm"
            >
              <Share className="h-4 w-4" />
            </Button>
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
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">{eventData.title}</h1>
            <p className="text-2xl font-bold text-primary mb-4">{eventData.price}</p>
            
            <div className="flex items-center justify-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{eventData.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{eventData.location}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">תיאור האירוע</h3>
            <p className="text-foreground leading-relaxed">{eventData.description}</p>
          </div>

          {/* Organizer */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">מארגן</h3>
            <div className="flex items-center gap-3">
              <img 
                src={eventData.organizer.image}
                alt={eventData.organizer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-foreground">{eventData.organizer.name}</p>
                <p className="text-sm text-muted-foreground">אינסטגרם: {eventData.instagram}</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8">
            <Button 
              onClick={handleJoinEvent}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-lg font-medium"
            >
              הצטרף לאירוע
            </Button>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default EventDetailsPage;
