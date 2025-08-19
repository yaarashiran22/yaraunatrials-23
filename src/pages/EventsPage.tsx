import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import EventFilterPopup from "@/components/EventFilterPopup";
import EventPopup from "@/components/EventPopup";
import NotificationsPopup from "@/components/NotificationsPopup";
import UniformCard from "@/components/UniformCard";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useItems } from "@/hooks/useItems";

const EventsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventPopupOpen, setIsEventPopupOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const { items, loading, fetchItems } = useItems();

  // Filter events from database
  const events = items
    .filter(item => item.category === 'event')
    .filter(item => 
      searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEventClick = (event: any) => {
    navigate(`/event/${event.id}`);
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
          <div className="grid grid-cols-3 gap-4 auto-rows-max">
            {[...Array(9)].map((_, index) => (
              <div key={index} className="w-full aspect-square bg-muted rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 auto-rows-max">
            {events.map((event) => (
              <UniformCard
                key={event.id}
                id={event.id}
                image={event.image_url || ""}
                title={event.title}
                subtitle={event.description || ""}
                price={event.price ? `${event.price} ₪` : ""}
                onClick={() => handleEventClick(event)}
                type="event"
                altText={`${event.title} - אירוע`}
                showFavoriteButton={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">לא נמצאו אירועים</p>
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