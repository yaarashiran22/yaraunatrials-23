import { useState, useMemo, useCallback, memo } from "react";
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

// Predefined neighborhoods - memoized for performance
const neighborhoods = [
  "All Neighborhoods",
  "Palermo",
  "Palermo Soho", 
  "Palermo Hollywood",
  "Palermo Chico",
  "Recoleta",
  "San Telmo",
  "Villa Crespo",
  "Caballito"
] as const;

// Price filter options - memoized for performance
const priceOptions = [
  "All Prices",
  "Free", 
  "Up to ₪50",
  "₪50-100",
  "₪100-200",
  "Over ₪200"
] as const;

// Mood filter options
const moodOptions = [
  "All",
  "Music", 
  "Art",
  "Sports",
  "Food",
  "Technology",
  "Business",
  "Education"
] as const;

// Date filter options
const dateOptions = [
  "All",
  "Today",
  "Tomorrow", 
  "This Week",
  "This Month"
] as const;

const AllEventsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { events, loading } = useEvents();

  // State management
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventPopupOpen, setIsEventPopupOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All Neighborhoods");
  const [priceFilter, setPriceFilter] = useState("All Prices");
  const [moodFilter, setMoodFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  // Optimized filtering with useMemo for better performance
  const filteredEvents = useMemo(() => {
    if (!events.length) return [];
    
    return events.filter(event => {
      // Search filter - case insensitive
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = event.title.toLowerCase().includes(query) ||
                             event.description?.toLowerCase().includes(query) ||
                             event.location?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Neighborhood filter
      if (selectedNeighborhood !== "All Neighborhoods") {
        if (!event.location?.includes(selectedNeighborhood)) return false;
      }

      // Price filter
      if (priceFilter !== "All Prices") {
        const priceStr = event.price || "0";
        const price = typeof priceStr === 'string' ? parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0 : priceStr;
        switch (priceFilter) {
          case "Free":
            if (price !== 0) return false;
            break;
          case "Up to ₪50":
            if (price === 0 || price > 50) return false;
            break;
          case "₪50-100":
            if (price <= 50 || price > 100) return false;
            break;
          case "₪100-200":
            if (price <= 100 || price > 200) return false;
            break;
          case "Over ₪200":
            if (price <= 200) return false;
            break;
        }
      }

      // Mood filter - use description as fallback for now
      if (moodFilter !== "All") {
        // Check if event description or title contains mood-related keywords
        const eventContent = `${event.title} ${event.description || ''}`.toLowerCase();
        const moodKeywords = {
          'Music': ['music', 'concert', 'band', 'song', 'מוזיקה', 'קונצרט'],
          'Art': ['art', 'gallery', 'paint', 'exhibition', 'אמנות', 'גלריה'],
          'Sports': ['sport', 'game', 'football', 'basketball', 'ספורט', 'כדורגל'],
          'Food': ['food', 'cooking', 'restaurant', 'chef', 'אוכל', 'מטבח'],
          'Technology': ['tech', 'startup', 'code', 'digital', 'טכנולוגיה'],
          'Business': ['business', 'network', 'entrepreneur', 'עסקים'],
          'Education': ['education', 'workshop', 'learn', 'course', 'חינוך', 'סדנה']
        };
        
        const keywords = moodKeywords[moodFilter as keyof typeof moodKeywords] || [];
        const hasMatchingKeyword = keywords.some(keyword => eventContent.includes(keyword));
        
        if (!hasMatchingKeyword) return false;
      }

      // Date filter
      if (dateFilter !== "All") {
        const today = new Date();
        const eventDate = event.date ? new Date(event.date) : null;
        
        if (!eventDate) return false;
        
        switch (dateFilter) {
          case "Today":
            if (eventDate.toDateString() !== today.toDateString()) return false;
            break;
          case "Tomorrow":
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            if (eventDate.toDateString() !== tomorrow.toDateString()) return false;
            break;
          case "This Week":
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            if (eventDate < today || eventDate > weekFromNow) return false;
            break;
          case "This Month":
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(today.getMonth() + 1);
            if (eventDate < today || eventDate > monthFromNow) return false;
            break;
        }
      }

      return true;
    });
  }, [events, searchQuery, selectedNeighborhood, priceFilter, moodFilter, dateFilter]);

  // Optimized event handlers with useCallback
  const handleEventClick = useCallback((event: any) => {
    setSelectedEvent({
      id: event.id,
      title: event.title,
      description: event.description || event.title,
      date: 'Date to be determined',
      time: 'Time to be determined',
      location: event.location || 'Tel Aviv',
      image: event.image_url || communityEvent,
      organizer: {
        name: "Event Organizer",
        image: profile1
      }
    });
    setIsEventPopupOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedNeighborhood("All Neighborhoods");
    setPriceFilter("All Prices");
    setMoodFilter("All");
    setDateFilter("All");
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
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
          <h1 className="text-lg font-semibold">All Events</h1>
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
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filter Options - Always Visible */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Neighborhood</label>
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
              <label className="text-sm font-medium mb-2 block">Price</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Mood</label>
              <Select value={moodFilter} onValueChange={setMoodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moodOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(selectedNeighborhood !== "All Neighborhoods" || priceFilter !== "All Prices" || moodFilter !== "All" || dateFilter !== "All") && (
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <main className="px-4 py-4">
        <div className="mb-4 text-sm text-muted-foreground">
          Found {filteredEvents.length} events
        </div>

        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="w-full aspect-[3/4] bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">Try changing your filters or search</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
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

// Memoized EventCard component for better performance
const EventCard = memo(({ event, onClick }: { event: any; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="cursor-pointer bg-card rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow"
  >
    <div className="aspect-[3/4] w-full">
      {event.image_url ? (
        <img 
          src={event.image_url} 
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <span className="text-lg">🎉</span>
        </div>
      )}
    </div>
    <div className="p-2">
      <h3 className="font-semibold text-xs mb-1 truncate leading-tight">
        {event.title}
      </h3>
      {event.location && (
        <p className="text-[10px] text-muted-foreground truncate">
          📍 {event.location}
        </p>
      )}
      {event.price && event.price > 0 ? (
        <p className="text-[10px] font-medium text-primary mt-1">
          ₪{event.price}
        </p>
      ) : (
        <p className="text-[10px] font-medium text-green-600 mt-1">
          Free
        </p>
      )}
    </div>
  </div>
));

export default AllEventsPage;