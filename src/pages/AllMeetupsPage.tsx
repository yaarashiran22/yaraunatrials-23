import { useState, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import MeetupVerticalPopup from "@/components/MeetupVerticalPopup";
import NotificationsPopup from "@/components/NotificationsPopup";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Bell } from "lucide-react";
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
  "Chill", 
  "Go Out",
  "Romantic",
  "Active",
  "Creative",
  "Wellness",
  "Sightseeing"
] as const;

// Date filter options
const dateOptions = [
  "All",
  "Today",
  "Tomorrow", 
  "This Week",
  "This Month"
] as const;

const AllMeetupsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { events: meetups, loading } = useEvents('meetup');

  // State management
  const [selectedMeetup, setSelectedMeetup] = useState<any>(null);
  const [isMeetupPopupOpen, setIsMeetupPopupOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All Neighborhoods");
  const [priceFilter, setPriceFilter] = useState("All Prices");
  const [moodFilter, setMoodFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  // Optimized filtering with useMemo for better performance
  const filteredMeetups = useMemo(() => {
    if (!meetups.length) return [];
    
    return meetups.filter(meetup => {
      // Search filter - case insensitive
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = meetup.title.toLowerCase().includes(query) ||
                             meetup.description?.toLowerCase().includes(query) ||
                             meetup.location?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Neighborhood filter
      if (selectedNeighborhood !== "All Neighborhoods") {
        if (!meetup.location?.includes(selectedNeighborhood)) return false;
      }

      // Price filter
      if (priceFilter !== "All Prices") {
        const priceStr = meetup.price || "0";
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
        // Check if meetup description or title contains mood-related keywords
        const meetupContent = `${meetup.title} ${meetup.description || ''}`.toLowerCase();
        const moodKeywords = {
          'Chill': ['chill', 'relax', 'coffee', 'cafe', 'calm', 'peaceful', 'casual', 'lounge'],
          'Go Out': ['party', 'night', 'club', 'bar', 'dance', 'nightlife', 'celebration', 'festival'],
          'Romantic': ['romantic', 'date', 'couple', 'love', 'dinner', 'wine', 'sunset', 'intimate'],
          'Active': ['sport', 'fitness', 'gym', 'run', 'bike', 'hike', 'workout', 'active', 'exercise'],
          'Creative': ['art', 'creative', 'workshop', 'paint', 'music', 'craft', 'design', 'artistic'],
          'Wellness': ['wellness', 'yoga', 'meditation', 'spa', 'health', 'mindfulness', 'therapy'],
          'Music': ['music', 'concert', 'live', 'band', 'song', 'artist', 'performance', 'sound', 'audio']
        };
        
        const keywords = moodKeywords[moodFilter as keyof typeof moodKeywords] || [];
        const hasMatchingKeyword = keywords.some(keyword => meetupContent.includes(keyword));
        
        if (!hasMatchingKeyword) return false;
      }

      // Date filter
      if (dateFilter !== "All") {
        const today = new Date();
        const meetupDate = meetup.date ? new Date(meetup.date) : null;
        
        if (!meetupDate) return false;
        
        switch (dateFilter) {
          case "Today":
            if (meetupDate.toDateString() !== today.toDateString()) return false;
            break;
          case "Tomorrow":
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            if (meetupDate.toDateString() !== tomorrow.toDateString()) return false;
            break;
          case "This Week":
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            if (meetupDate < today || meetupDate > weekFromNow) return false;
            break;
          case "This Month":
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(today.getMonth() + 1);
            if (meetupDate < today || meetupDate > monthFromNow) return false;
            break;
        }
      }

      return true;
    });
  }, [meetups, searchQuery, selectedNeighborhood, priceFilter, moodFilter, dateFilter]);

  // Optimized meetup handlers with useCallback
  const handleMeetupClick = useCallback((meetup: any) => {
    setSelectedMeetup({
      id: meetup.id,
      title: meetup.title,
      description: meetup.description || meetup.title,
      date: 'Date to be determined',
      time: 'Time to be determined',
      location: meetup.location || 'Tel Aviv',
      image: meetup.image_url || communityEvent,
      organizer: {
        name: "Meetup Organizer",
        image: profile1
      }
    });
    setIsMeetupPopupOpen(true);
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
      <div className="bg-gradient-to-r from-card via-card/95 to-card border-b border-primary/10 px-6 py-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="p-3 rounded-full hover:bg-primary/10 transition-all duration-200 border border-primary/20 hover:border-primary/40"
            >
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">All Meetups</h1>
              <p className="text-sm text-muted-foreground">Connect with people who share your interests</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="px-6 py-6 space-y-6 bg-gradient-to-br from-muted/30 via-muted/20 to-transparent backdrop-blur-sm border-b border-primary/10">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 h-5 w-5" />
          <Input
            placeholder="Search meetups by topic, location, or interests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 rounded-2xl border-primary/20 bg-white focus:bg-white focus:border-primary/40 transition-all duration-200 placeholder:text-muted-foreground/60 text-base"
          />
        </div>

        {/* Filter Options - Enhanced Design */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                Neighborhood
              </label>
              <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
                <SelectTrigger className="rounded-xl border-primary/20 bg-white hover:border-primary/40 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/20">
                  {neighborhoods.map((neighborhood) => (
                    <SelectItem key={neighborhood} value={neighborhood} className="rounded-lg">
                      {neighborhood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                Price Range
              </label>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="rounded-xl border-primary/20 bg-white hover:border-primary/40 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/20">
                  {priceOptions.map((option) => (
                    <SelectItem key={option} value={option} className="rounded-lg">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                Vibe
              </label>
              <Select value={moodFilter} onValueChange={setMoodFilter}>
                <SelectTrigger className="rounded-xl border-primary/20 bg-white hover:border-primary/40 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/20">
                  {moodOptions.map((option) => (
                    <SelectItem key={option} value={option} className="rounded-lg">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                When
              </label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="rounded-xl border-primary/20 bg-white hover:border-primary/40 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/20">
                  {dateOptions.map((option) => (
                    <SelectItem key={option} value={option} className="rounded-lg">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(selectedNeighborhood !== "All Neighborhoods" || priceFilter !== "All Prices" || moodFilter !== "All" || dateFilter !== "All") && (
            <div className="flex justify-center pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearFilters}
                className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/60 transition-all duration-200"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <main className="px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-base font-medium text-foreground flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">{filteredMeetups.length}</span> meetups found
          </div>
          {filteredMeetups.length > 0 && (
            <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-primary">
              Sort by date
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="w-full aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredMeetups.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-primary">No meetups</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">No meetups found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Try adjusting your filters or search terms to discover meetups with like-minded people</p>
            <Button variant="outline" onClick={clearFilters} className="rounded-full border-primary/30 hover:bg-primary/10">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
            {filteredMeetups.map((meetup, index) => (
              <div key={meetup.id} className="animate-fade-in" style={{animationDelay: `${index * 0.05}s`}}>
                <MeetupCard
                  meetup={meetup}
                  onClick={() => handleMeetupClick(meetup)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <MeetupVerticalPopup 
        isOpen={isMeetupPopupOpen}
        onClose={() => setIsMeetupPopupOpen(false)}
        item={selectedMeetup}
      />

      <NotificationsPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <BottomNavigation />
    </div>
  );
};

// Memoized MeetupCard component for better performance
const MeetupCard = memo(({ meetup, onClick }: { meetup: any; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="cursor-pointer bg-gradient-to-br from-card to-card/95 rounded-2xl overflow-hidden shadow-sm border border-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group hover:scale-[1.02] hover:border-primary/30"
  >
    <div className="aspect-[3/4] w-full relative overflow-hidden">
      {meetup.image_url ? (
        <img 
          src={meetup.image_url} 
          alt={meetup.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
          <span className="text-4xl text-primary">Meetup</span>
        </div>
      )}
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Price badge */}
      {meetup.price && meetup.price > 0 ? (
        <div className="absolute top-3 right-3 bg-warning/90 backdrop-blur-sm text-warning-foreground px-3 py-1 rounded-full text-xs font-bold border border-warning/20">
          ₪{meetup.price}
        </div>
      ) : (
        <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-xs font-bold border border-green-400/20">
          Free
        </div>
      )}
    </div>
    
    <div className="p-4">
      <h3 className="font-bold text-sm mb-2 truncate leading-tight text-foreground group-hover:text-primary transition-colors">
        {meetup.title}
      </h3>
      {meetup.location && (
        <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mb-1">
          {meetup.location}
        </p>
      )}
      {meetup.date && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {new Date(meetup.date).toLocaleDateString()}
        </p>
      )}
    </div>
  </div>
));

export default AllMeetupsPage;