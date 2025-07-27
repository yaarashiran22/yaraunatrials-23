import { useState } from "react";
import { ArrowLeft, MapPin, Heart, MoreHorizontal, Copy, ExternalLink, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NotificationsPopup from "@/components/NotificationsPopup";
import UniformCard from "@/components/UniformCard";

import communityEvent from "@/assets/community-event.jpg";
import coffeeShop from "@/assets/coffee-shop.jpg";
import vintageStore from "@/assets/vintage-store.jpg";
import dressItem from "@/assets/dress-item.jpg";
import furnitureItem from "@/assets/furniture-item.jpg";

const NeighborhoodProfilePage = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const events = [
    {
      image: communityEvent,
      title: "טנגו ביצירת",
      subtitle: "21:00 • היום"
    },
    {
      image: coffeeShop,
      title: "מכירה אמר כתיר",
      subtitle: "20:00 • מחר"
    }
  ];

  const announcements = [
    {
      title: "מחפש/ת חניקון למסיבת ספורט",
      description: "בחורה בראשון הקרב 16:00"
    },
    {
      title: "חדר צעיר אורדן ומריח מדרום",
      description: "במטבח חדש שפר שכתבט! 1"
    }
  ];

  const vibePhotos = [
    { image: coffeeShop },
    { image: vintageStore },
    { image: dressItem },
    { image: furnitureItem }
  ];

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Custom Header - Same as Homepage */}
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
        {/* Profile Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <img 
              src={coffeeShop} 
              alt="TEDER FM"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">TEDER FM</h1>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-3">
            <span>מאי 2016</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>פלורנטין</span>
            </div>
          </div>
          
          <div className="px-4 mb-4">
            <p className="text-foreground mb-2">הכל של חיי ההליה בעיר</p>
            <div className="flex items-center justify-center gap-1 text-primary text-sm">
              <ExternalLink className="h-4 w-4" />
              <span>https://www.teder.fm</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-sm text-muted-foreground">@tederfm</span>
            <Button variant="outline" size="sm" className="rounded-full px-6">
              <Copy className="h-4 w-4 ml-2" />
              הוסף
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Events Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">אירועים</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {events.map((event, index) => (
                <div key={index} className="flex-shrink-0 w-64">
                  <UniformCard
                    image={event.image}
                    title={event.title}
                    subtitle={event.subtitle}
                    type="event"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Announcements Board */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">לוח הודעות</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {announcements.map((announcement, index) => (
                <div key={index} className="flex-shrink-0 w-64 bg-primary-soft rounded-xl p-4 shadow-card">
                  <p className="text-sm text-foreground mb-3 leading-relaxed">{announcement.title}</p>
                  <p className="text-xs text-muted-foreground mb-3">{announcement.description}</p>
                  <div className="flex items-center justify-start">
                    <Button variant="ghost" size="sm" className="p-1">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Vibe Photos */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">ויב דומה</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {vibePhotos.map((photo, index) => (
                <div key={index} className="flex-shrink-0 w-64">
                  <UniformCard
                    image={photo.image}
                    title={`תמונה ${index + 1}`}
                    subtitle="ויב השכונה"
                    type="event"
                  />
                </div>
              ))}
            </div>
          </section>
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

export default NeighborhoodProfilePage;