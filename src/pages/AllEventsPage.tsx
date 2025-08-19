import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import EventPopup from "@/components/EventPopup";
import NotificationsPopup from "@/components/NotificationsPopup";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, Search, ArrowLeft, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEvents } from "@/hooks/useEvents";

import communityEvent from "@/assets/community-event.jpg";
import profile1 from "@/assets/profile-1.jpg";

// Predefined neighborhoods in Tel Aviv
const neighborhoods = [
  "כל השכונות",
  "לב העיר",
  "נחלת בנימין",
  "רוטשילד",
  "פלורנטין",
  "שפירא",
  "יפו העתיקה",
  "עג'מי",
  "נווה צדק",
  "כרם התימנים",
  "שכונת מונטיפיורי",
  "רמת אביב",
  "צפון ישן",
  "שינקין",
  "דיזנגוף",
  "הרצליה",
  "בת ים",
  "חולון"
];

const AllEventsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { events, loading } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventPopupOpen, setIsEventPopupOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("כל השכונות");
  const [priceFilter, setPriceFilter] = useState("כל המחירים");
  const [showFilters, setShowFilters] = useState(false);

  // Price filter options
  const priceOptions = [
    "כל המחירים",
    "חינם",
    "עד 50 ₪",
    "50-100 ₪", 
    "100-200 ₪",
    "מעל 200 ₪"
  ];

  // Filter events based on search, neighborhood, and price
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Neighborhood filter
      const matchesNeighborhood = selectedNeighborhood === "כל השכונות" || 
                                  event.location?.includes(selectedNeighborhood);

      // Price filter
      let matchesPrice = true;
      if (priceFilter !== "כל המחירים") {
        const price = event.price || 0;
        switch (priceFilter) {
          case "חינם":
            matchesPrice = price === 0;
            break;
          case "עד 50 ₪":
            matchesPrice = price > 0 && price <= 50;
            break;
          case "50-100 ₪":
            matchesPrice = price > 50 && price <= 100;
            break;
          case "100-200 ₪":
            matchesPrice = price > 100 && price <= 200;
            break;
          case "מעל 200 ₪":
            matchesPrice = price > 200;
            break;
        }
      }

      return matchesSearch && matchesNeighborhood && matchesPrice;
    });
  }, [events, searchQuery, selectedNeighborhood, priceFilter]);

  const handleEventClick = (event: any) => {
    setSelectedEvent({
      id: event.id,
      title: event.title,
      description: event.description || event.title,
      date: 'תאריך יקבע בהמשך',
      time: 'שעה תקבע בהמשך',
      location: event.location || 'תל אביב',
      image: event.image_url || communityEvent,
      organizer: {
        name: "מארגן האירוע",
        image: profile1
      }
    });
    setIsEventPopupOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedNeighborhood("כל השכונות");
    setPriceFilter("כל המחירים");
  };

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Custom Header with Back Button */}
      <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">כל האירועים</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotifications(true)}
          className="p-2"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Search and Filter Section */}
      <div className="px-4 py-4 space-y-4 bg-card/30 backdrop-blur-sm border-b">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="חיפוש אירועים..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filter Toggle Button */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            סינון
          </Button>
          
          {(selectedNeighborhood !== "כל השכונות" || priceFilter !== "כל המחירים") && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              נקה סינונים
            </Button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-sm font-medium mb-2 block">שכונה</label>
              <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {neighborhoods.map((neighborhood) => (
                    <SelectItem key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">מחיר</label>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <main className="px-4 py-4">
        <div className="mb-4 text-sm text-muted-foreground">
          נמצאו {filteredEvents.length} אירועים מתוך {events.length} סה"כ
          <br />
          DEBUG: Loading: {loading.toString()}, Total events: {events.length}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="w-full aspect-square bg-muted rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">לא נמצאו אירועים</h3>
            <p className="text-muted-foreground mb-4">נסה לשנות את הסינונים או החיפוש</p>
            <Button variant="outline" onClick={clearFilters}>
              נקה סינונים
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEvents.map((event) => (
              <div 
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="cursor-pointer bg-card rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="aspect-square w-full">
                  {event.image_url ? (
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-2xl">🎉</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-right mb-1 truncate">
                    {event.title}
                  </h3>
                  {event.location && (
                    <p className="text-xs text-muted-foreground text-right truncate">
                      📍 {event.location}
                    </p>
                  )}
                  {event.price && event.price > 0 ? (
                    <p className="text-xs font-medium text-primary text-right mt-1">
                      {event.price} ₪
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-green-600 text-right mt-1">
                      חינם
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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

export default AllEventsPage;