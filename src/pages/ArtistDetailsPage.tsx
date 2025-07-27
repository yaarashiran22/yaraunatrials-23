
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Navigation, Share, Heart, MapPin, Star, Instagram, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NotificationsPopup from "@/components/NotificationsPopup";
import UniformCard from "@/components/UniformCard";
import { useToast } from "@/hooks/use-toast";
import profile1 from "@/assets/profile-1.jpg";
import communityEvent from "@/assets/community-event.jpg";
import dressItem from "@/assets/dress-item.jpg";

const ArtistDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();

  // Mock data - in a real app this would come from an API
  const artistData = {
    id: id || "1",
    name: "יערה שיין",
    image: profile1,
    profession: "צלמת ויוצרת תוכן",
    bio: "צלמת מקצועית המתמחה בצילומי אירועים ופורטרטים. עובדת בתחום כבר 5 שנים ומתמחה ביצירת תוכן ויזואלי ייחודי.",
    location: "תל אביב",
    rating: 4.9,
    reviewCount: 45,
    phone: "054-1234567",
    instagram: "yaratakingphotos@",
    website: "www.yaraphotos.com",
    specialties: ["צילומי אירועים", "פורטרטים", "צילומי רחוב", "עריכת תמונות"],
    experience: "5 שנות ניסיון"
  };

  const artistWorks = [
    {
      image: communityEvent,
      title: "צילום אירוע קהילתי",
      subtitle: "צילום מקצועי"
    },
    {
      image: dressItem,
      title: "סשן צילומי אופנה",
      subtitle: "פורטרט"
    }
  ];

  const handleCall = () => {
    if (artistData.phone) {
      window.open(`tel:${artistData.phone}`, '_self');
    }
  };

  const handleShare = () => {
    toast({
      title: "שותף בהצלחה!",
      description: "הפרופיל שותף ברשתות החברתיות",
    });
  };

  const handleContact = () => {
    toast({
      title: "פותח צ'אט",
      description: "מפנה לשיחה עם האמן",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Custom Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="text-4xl font-black font-nunito" style={{ color: '#BB31E9', textShadow: '0 0 2px rgba(187, 49, 233, 0.5)' }}>una</div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <NeighborhoodSelector />
        <Button variant="ghost" size="sm" onClick={() => setShowNotifications(true)}>
          <Bell className="h-5 w-5" />
        </Button>
      </div>
      
      <main className="px-4 py-6">
        {/* Artist Profile */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <img 
              src={artistData.image}
              alt={artistData.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
            />
            <div className="absolute top-2 right-2 flex gap-2">
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
          
          <h1 className="text-3xl font-bold text-foreground mb-2">{artistData.name}</h1>
          <p className="text-lg text-primary mb-4">{artistData.profession}</p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{artistData.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{artistData.rating}</span>
              <span>({artistData.reviewCount} ביקורות)</span>
            </div>
          </div>
          
          <p className="text-foreground leading-relaxed mb-6 px-4">{artistData.bio}</p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Instagram className="h-4 w-4" />
            <span>{artistData.instagram}</span>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <Button 
              onClick={handleCall}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-6"
            >
              <Phone className="h-4 w-4 ml-2" />
              התקשר
            </Button>
            <Button 
              onClick={handleContact}
              variant="outline"
              className="rounded-2xl px-6"
            >
              שלח הודעה
            </Button>
          </div>
        </div>

        {/* Artist Details */}
        <div className="space-y-6">
          {/* Specialties */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">התמחויות</h3>
            <div className="flex flex-wrap gap-2">
              {artistData.specialties.map((specialty, index) => (
                <span 
                  key={index}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">ניסיון</h3>
            <p className="text-foreground">{artistData.experience}</p>
          </div>

          {/* Portfolio */}
          <div>
            <h3 className="text-lg font-semibold mb-4">עבודות</h3>
            <div className="grid grid-cols-2 gap-4">
              {artistWorks.map((work, index) => (
                <UniformCard
                  key={index}
                  image={work.image}
                  title={work.title}
                  subtitle={work.subtitle}
                  type="business"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <NotificationsPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <BottomNavigation />
    </div>
  );
};

export default ArtistDetailsPage;
