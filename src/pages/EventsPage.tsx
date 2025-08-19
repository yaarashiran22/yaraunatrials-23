import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import EventFilterPopup from "@/components/EventFilterPopup";
import EventPopup from "@/components/EventPopup";
import NotificationsPopup from "@/components/NotificationsPopup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEvents } from "@/hooks/useEvents";

const EventsPage = () => {
  console.log("EventsPage component rendering");
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { events, loading } = useEvents();
  console.log("Events data:", events, "Loading:", loading);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventPopupOpen, setIsEventPopupOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEventClick = (event: any) => {
    setSelectedEvent({
      title: event.title,
      image: event.image_url,
      price: event.price ? `${event.price} ₪` : "חינם",
      description: event.description || "",
      location: event.location
    });
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
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="w-full aspect-square bg-muted rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">אין אירועים זמינים</p>
            <p className="text-xs text-muted-foreground mt-2">DEBUG: Total events: {events.length}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 auto-rows-max">
            {filteredEvents.map((event) => (
              <div 
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="cursor-pointer w-full hover:scale-105 transition-transform duration-200"
              >
                <div className="bg-card rounded-xl overflow-hidden shadow-sm border">
                  {event.image_url ? (
                    <div className="aspect-square w-full">
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square w-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">אין תמונה</span>
                    </div>
                  )}
                  <div className="p-2">
                    <h3 className="font-semibold text-xs text-right truncate">{event.title}</h3>
                    {event.description && (
                      <p className="text-xs text-muted-foreground text-right mt-1 truncate">{event.description}</p>
                    )}
                    {event.price && (
                      <p className="text-xs font-medium text-primary text-right mt-1">{event.price} ₪</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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