import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import EventFilterPopup from "@/components/EventFilterPopup";
import EventPopup from "@/components/EventPopup";
import NotificationsPopup from "@/components/NotificationsPopup";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

import communityEvent from "@/assets/community-event.jpg";

const EventsPage = () => {
  console.log("EventsPage loading - no coffeeShop references");  // Debug log
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventPopupOpen, setIsEventPopupOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const events = [
    {
      id: 1,
      image: communityEvent,
      title: "פיצה מיוחדת",
      subtitle: "ערב פיצה בדוחי",
      details: {
        title: "פיצה מיוחדת",
        image: communityEvent,
        price: "50 ₪",
        description: "ערב פיצה מיוחד עם רכיבים איכותיים",
        instagram: "pizza_event@"
      }
    },
    {
      id: 2,
      title: "MSBR",
      subtitle: "אירוע מיוחד",
      details: {
        title: "MSBR",
        price: "חינם",
        description: "אירוע מיוחד במקום",
        instagram: "msbr@"
      }
    }
  ];

  const handleEventClick = (event: any) => {
    setSelectedEvent(event.details);
    setIsEventPopupOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <Header 
        title="אירועים"
        showSearch={true}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="אירועים"
        onNotificationsClick={() => setShowNotifications(true)}
      />
      
      {/* Content Grid */}
      <main className="px-4 py-4">
        <div className="grid grid-cols-3 gap-4 auto-rows-max">
          {/* Featured Event Card */}
          <div 
            onClick={() => handleEventClick(events[0])}
            className="cursor-pointer w-full"
          >
            <div className="bg-card rounded-xl overflow-hidden shadow-sm border">
              <div className="aspect-square w-full">
                <img 
                  src={events[0].image} 
                  alt={events[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2">
                <h3 className="font-semibold text-xs text-right truncate">{events[0].title}</h3>
                <p className="text-xs text-muted-foreground text-right mt-1 truncate">{events[0].subtitle}</p>
              </div>
            </div>
          </div>
          
          {/* MSBR Card */}
          <div 
            onClick={() => handleEventClick(events[1])}
            className="cursor-pointer w-full"
          >
            <div className="bg-card rounded-xl overflow-hidden shadow-sm border aspect-square flex items-center justify-center" style={{ backgroundColor: '#374151' }}>
              <div className="text-center">
                <div className="text-sm font-bold" style={{ color: '#10B981' }}>MS</div>
                <div className="text-sm font-bold" style={{ color: '#F59E0B' }}>BR</div>
              </div>
            </div>
          </div>
          
          {/* Placeholder Cards */}
          {[...Array(9)].map((_, index) => (
            <div key={index} className="w-full aspect-square bg-muted rounded-xl"></div>
          ))}
        </div>
      </main>

      <EventFilterPopup 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      <EventPopup 
        isOpen={isEventPopupOpen}
        onClose={() => setIsEventPopupOpen(false)}
        event={selectedEvent}
      />

      <NotificationsPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <BottomNavigation />
    </div>
  );
};

export default EventsPage;