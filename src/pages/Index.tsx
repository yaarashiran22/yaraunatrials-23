
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import DesktopHeader from "@/components/DesktopHeader";
import MoodFilterStrip from "@/components/MoodFilterStrip";
import FilterPopup from "@/components/FilterPopup";
import EventPopup from "@/components/EventPopup";
import MarketplacePopup from "@/components/MarketplacePopup";
import NotificationsPopup from "@/components/NotificationsPopup";
import ProfileCard from "@/components/ProfileCard";
import AddStoryButton from "@/components/AddStoryButton";
import ScrollAnimatedCard from "@/components/ScrollAnimatedCard";
import UniformCard from "@/components/UniformCard";
import AddRecommendationCard from "@/components/AddRecommendationCard";
import FriendMeetupPopup from "@/components/FriendMeetupPopup";
import CreateEventPopup from "@/components/CreateEventPopup";
import { getRelativeDay } from "@/utils/dateUtils";
import SectionHeader from "@/components/SectionHeader";
import FastLoadingSkeleton from "@/components/FastLoadingSkeleton";
import FloatingMapToggle from "@/components/FloatingMapToggle";
import FullscreenMap from "@/components/FullscreenMap";
import { Button } from "@/components/ui/button";
import { Bell, Users, Plus } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNewItem } from "@/contexts/NewItemContext";
import { useOptimizedHomepage } from "@/hooks/useOptimizedHomepage";
import { useEvents } from "@/hooks/useEvents";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";
import coffeeShop from "@/assets/coffee-shop.jpg";
import vintageStore from "@/assets/vintage-store.jpg";
import communityEvent from "@/assets/community-event.jpg";
import dressItem from "@/assets/dress-item.jpg";
import furnitureItem from "@/assets/furniture-item.jpg";
import artPiece1 from "@/assets/canvas-art-1.jpg";
import artPiece2 from "@/assets/canvas-art-2.jpg";
import artPiece3 from "@/assets/canvas-art-3.jpg";
import artPiece4 from "@/assets/canvas-art-4.jpg";

const Index = () => {
  const { t, language } = useLanguage();
  const { setRefreshCallback, openNewItem } = useNewItem();
  const { user } = useAuth();
  const { profile: currentUserProfile } = useProfile(user?.id);
  const navigate = useNavigate();

  // Listen for navigation events from MarketplacePopup
  useEffect(() => {
    const handleNavigateToItem = (event: CustomEvent) => {
      setSelectedMarketplaceItem(event.detail);
      setIsMarketplacePopupOpen(true);
    };

    window.addEventListener('navigateToItem', handleNavigateToItem);
    return () => window.removeEventListener('navigateToItem', handleNavigateToItem);
  }, []);
  
  // Use optimized homepage hook with React Query caching
  const { 
    profiles, 
    totalUsersCount,
    marketplaceItems, 
    databaseEvents,
    recommendationItems, 
    artItems,
    apartmentItems,
    businessItems,
    loading, 
    error,
    refetch,
    preloadData
  } = useOptimizedHomepage();

  // Fetch events and meetups separately from the new events table
  const { events: realEvents = [], refetch: refetchEvents } = useEvents('event');
  const { events: meetupEvents = [], refetch: refetchMeetups } = useEvents('meetup');

  // Preload data immediately on component mount for instant loading
  useEffect(() => {
    preloadData();
  }, [preloadData]);

  // Popup states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventPopupOpen, setIsEventPopupOpen] = useState(false);
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState<any>(null);
  const [isMarketplacePopupOpen, setIsMarketplacePopupOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriendMeetup, setShowFriendMeetup] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Set refresh callback for new items
  useEffect(() => {
    setRefreshCallback(() => () => {
      refetch();
      refetchEvents();
      refetchMeetups();
    });
  }, [setRefreshCallback, refetch, refetchEvents, refetchMeetups]);

  // Global event listener for event updates
  useEffect(() => {
    const handleEventUpdate = () => {
      refetchEvents();
      refetchMeetups();
    };

    window.addEventListener('eventUpdated', handleEventUpdate);
    return () => window.removeEventListener('eventUpdated', handleEventUpdate);
  }, [refetchEvents, refetchMeetups]);

  const [userStoryCounts, setUserStoryCounts] = useState<{[key: string]: number}>({});

  // Optimize story counts fetching - disable for faster loading
  useEffect(() => {
    // Skip story counts for faster initial load
    return;
  }, []);

  // Memoize display profiles with immediate display for performance
  const displayProfiles = useMemo(() => {
    const profilesList = [];
    
    // Always show current user first if logged in - immediate display
    if (user) {
      const currentUserDisplayProfile = {
        id: user.id,
        name: currentUserProfile?.name || user.email?.split('@')[0] || 'You',
        image: currentUserProfile?.profile_image_url || user.user_metadata?.avatar_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png",
        isCurrentUser: true,
        hasStories: false // Skip stories for performance
      };
      profilesList.push(currentUserDisplayProfile);
    }

    // Add other profiles (top 10 newest users only)
    if (profiles.length > 0) {
      const otherProfiles = profiles
        .filter(p => p.id !== user?.id)
        .slice(0, 10) // Show only top 10 newest users
        .map(p => ({
          id: p.id,
          name: p.name || "User",
          image: p.image || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png",
          hasStories: false, // Skip stories check for performance
          isCurrentUser: false
        }));

      profilesList.push(...otherProfiles);
    }

    return profilesList;
  }, [user, currentUserProfile, profiles]); // Removed userStoryCounts dependency

  // All business, event, and artwork data now comes from the database
  // Static data has been removed to show only real content

  // Memoize event handlers to prevent unnecessary re-renders
  const handleEventClick = useCallback((event: any) => {
    setSelectedEvent(event);
    setIsEventPopupOpen(true);
  }, []);

  const handleMarketplaceClick = useCallback((item: any, itemType?: string, items?: any[], currentIndex?: number) => {
    const itemDetails = {
      id: item.id,
      title: item.title,
      image: item.image_url || item.image,
      price: item.price ? `₪${item.price}` : undefined,
      description: item.description || `${item.title} in excellent condition.`,
      seller: {
        name: "Yael Shein",
        image: profile1,
        location: item.location || "Tel Aviv"
      },
      condition: "Like New",
      type: itemType || 'marketplace'
    };
    setSelectedMarketplaceItem({
      ...itemDetails,
      allItems: items || [item],
      currentIndex: currentIndex || 0
    });
    setIsMarketplacePopupOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="ltr">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header 
          title={t('common.home')}
          onNotificationsClick={() => setShowNotifications(true)}
        />
      </div>
      
      {/* Desktop Header */}
      <DesktopHeader 
        title={t('common.home')}
        onNotificationsClick={() => setShowNotifications(true)}
      />
      
      {/* Mood Filter Strip */}
      <MoodFilterStrip />
      
      <main className="px-4 lg:px-6 py-4 lg:py-6 space-y-6 lg:space-y-8 pb-20 lg:pb-8 w-full">
        {/* Community Members Section - Horizontal Carousel */}
        <section className="mb-3 lg:mb-4">
          <div className="relative">
            <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40" dir="ltr" style={{scrollBehavior: 'smooth'}}>
              {loading ? (
                <FastLoadingSkeleton type="profiles" />
              ) : displayProfiles.length > 0 ? (
                displayProfiles.map((profile, index) => (
                  <ProfileCard
                    key={profile.id}
                    id={profile.id}
                    image={profile.image}
                    name={profile.name}
                    className={`flex-shrink-0 min-w-[90px] animate-fade-in ${index === 0 && user?.id === profile.id ? '' : ''}`}
                    style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` } as React.CSSProperties}
                    isCurrentUser={user?.id === profile.id}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground w-full">No registered users yet</div>
              )}
            </div>
          </div>
        </section>


        {/* Join me Section - Horizontal Carousel */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-3 lg:p-5 border border-border/20 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-foreground relative">
              <span className="relative z-10 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-sm">
                {t('sections.joinMe')}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/8 to-primary/5 blur-sm -z-10 transform translate-x-0.5 translate-y-0.5 rounded-md"></div>
            </h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCreateEvent(true)}
                className="text-xs px-2 py-1 rounded-full border border-black/20 bg-transparent text-foreground hover:border-black/30 gap-1"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/all-events')}
                className="text-xs px-3 py-1"
              >
                All
              </Button>
            </div>
          </div>
          {loading ? (
            <FastLoadingSkeleton type="cards" count={3} />
          ) : meetupEvents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No meetups available at the moment</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-5 pb-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40" dir="ltr" style={{scrollBehavior: 'smooth'}}>
              {meetupEvents.slice(0, 3).map((event, index) => (
                <ScrollAnimatedCard key={`meetup-${event.id}`} index={index}>
                  <UniformCard
                    id={event.id}
                    image={event.image_url || communityEvent}
                    video={(event as any).video_url}
                    title={event.title}
                    subtitle={event.location || 'Tel Aviv'}
                    price={event.price}
                    date={getRelativeDay(event.date)}
                    type="event"
                    uploader={event.uploader}
                    onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                    onClick={() => handleEventClick({
                      id: event.id,
                      title: event.title,
                      description: event.description || event.title,
                      date: event.date || 'Date to be determined',
                      time: event.time || 'Time to be determined', 
                      location: event.location || 'Tel Aviv',
                      price: event.price,
                      image: event.image_url || communityEvent,
                      video: (event as any).video_url,
                      organizer: {
                        name: event.uploader?.name || "Event Organizer",
                        image: event.uploader?.image || profile1
                      }
                    })}
                    showFavoriteButton={true}
                    favoriteData={{
                      id: event.id,
                      title: event.title,
                      description: event.description || event.title,
                      image: event.image_url,
                      type: 'meetup'
                    }}
                  />
                </ScrollAnimatedCard>
              ))}
            </div>
          )}
        </section>

        {/* Events Section - Horizontal Carousel */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-3 lg:p-5 border border-border/20 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-foreground relative">
              <span className="relative z-10 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-sm">
                {t('events.title')}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/8 to-primary/5 blur-sm -z-10 transform translate-x-0.5 translate-y-0.5 rounded-md"></div>
            </h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCreateEvent(true)}
                className="text-xs px-2 py-1 rounded-full border border-black/20 bg-transparent text-foreground hover:border-black/30 gap-1"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/all-events')}
                className="text-xs px-3 py-1"
              >
                All
              </Button>
            </div>
          </div>
          {loading ? (
            <FastLoadingSkeleton type="cards" count={3} />
          ) : realEvents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No events available at the moment</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-5 pb-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40" dir="ltr" style={{scrollBehavior: 'smooth'}}>
              {realEvents.slice(0, 3).map((event, index) => (
                <ScrollAnimatedCard key={`event-${event.id}`} index={index}>
                   <UniformCard
                     id={event.id}
                     image={event.image_url || communityEvent}
                     video={(event as any).video_url}
                     title={event.title}
                     subtitle={event.location || 'Tel Aviv'}
                     price={event.price}
                     date={getRelativeDay(event.date)}
                     type="event"
                     uploader={event.uploader}
                     onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                     onClick={() => handleEventClick({
                       id: event.id,
                       title: event.title,
                       description: event.description || event.title,
                       date: event.date || 'Date to be determined',
                       time: event.time || 'Time to be determined', 
                       location: event.location || 'Tel Aviv',
                       price: event.price,
                       image: event.image_url || communityEvent,
                       video: (event as any).video_url,
                       organizer: {
                         name: event.uploader?.name || "Event Organizer",
                         image: event.uploader?.image || profile1
                       }
                     })}
                     showFavoriteButton={true}
                     favoriteData={{
                       id: event.id,
                       title: event.title,
                       description: event.description || event.title,
                       image: event.image_url,
                       type: 'event'
                     }}
                   />
                </ScrollAnimatedCard>
              ))}
            </div>
          )}
        </section>

        {/* Coupons Section - Horizontal Carousel */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-3 lg:p-5 border border-border/20 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-foreground relative">
              <span className="relative z-10 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-sm">
                {t('sections.communityCoupons')}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/8 to-primary/5 blur-sm -z-10 transform translate-x-0.5 translate-y-0.5 rounded-md"></div>
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-5 pb-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40" dir="ltr" style={{scrollBehavior: 'smooth'}}>
            <div className="text-center py-6 text-muted-foreground w-full">
              <p>No coupons available at the moment</p>
            </div>
          </div>
        </section>



      </main>
      
      {/* Conditional Popup Rendering for Performance */}
      {isFilterOpen && (
        <FilterPopup 
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />
      )}

      {isEventPopupOpen && selectedEvent && (
        <EventPopup 
          isOpen={isEventPopupOpen}
          onClose={() => setIsEventPopupOpen(false)}
          eventId={selectedEvent?.id}
          event={selectedEvent}
        />
      )}

      {isMarketplacePopupOpen && selectedMarketplaceItem && (
        <MarketplacePopup 
          isOpen={isMarketplacePopupOpen}
          onClose={() => setIsMarketplacePopupOpen(false)}
          item={selectedMarketplaceItem}
        />
      )}

      {showNotifications && (
        <NotificationsPopup 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />
      )}

      {showFriendMeetup && (
        <FriendMeetupPopup 
          isOpen={showFriendMeetup} 
          onClose={() => setShowFriendMeetup(false)} 
        />
      )}

      {showCreateEvent && (
        <CreateEventPopup 
          isOpen={showCreateEvent} 
          onClose={() => setShowCreateEvent(false)} 
          onEventCreated={() => {
            refetchEvents();
            refetchMeetups();
            refetch();
          }}
        />
      )}

      {/* Floating Map Toggle */}
      <FloatingMapToggle 
        isMapOpen={isMapOpen}
        onToggle={() => setIsMapOpen(!isMapOpen)}
      />

      {/* Fullscreen Map */}
      <FullscreenMap 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default Index;
