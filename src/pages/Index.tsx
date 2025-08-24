
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import DesktopHeader from "@/components/DesktopHeader";
import FilterPopup from "@/components/FilterPopup";
import EventPopup from "@/components/EventPopup";
import MarketplacePopup from "@/components/MarketplacePopup";
import NotificationsPopup from "@/components/NotificationsPopup";
import ProfileCard from "@/components/ProfileCard";
import AddStoryButton from "@/components/AddStoryButton";
import UniformCard from "@/components/UniformCard";
import AddRecommendationCard from "@/components/AddRecommendationCard";
import FriendMeetupPopup from "@/components/FriendMeetupPopup";
import CreateEventPopup from "@/components/CreateEventPopup";
import SectionHeader from "@/components/SectionHeader";
import FastLoadingSkeleton from "@/components/FastLoadingSkeleton";
import FloatingMapToggle from "@/components/FloatingMapToggle";
import FullscreenMap from "@/components/FullscreenMap";
import { Button } from "@/components/ui/button";
import { Bell, Users, Plus } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNewItem } from "@/contexts/NewItemContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useOptimizedHomepage } from "@/hooks/useOptimizedHomepage";
import { useEvents } from "@/hooks/useEvents";

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

  // Fetch events from the new events table
  const { events: realEvents = [], refetch: refetchEvents } = useEvents();

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
    setRefreshCallback(() => refetch);
  }, [setRefreshCallback, refetch]);

  // Memoize display profiles to prevent unnecessary re-calculations
  const displayProfiles = useMemo(() => {
    if (!user || !currentUserProfile) {
      return profiles;
    }

    // Filter out current user from other profiles to avoid duplicates
    const otherProfiles = profiles.filter(p => p.id !== user.id);
    
    // Add current user's profile first
    const currentUserDisplayProfile = {
      id: user.id,
      name: currentUserProfile.name || 'You',
      image: currentUserProfile.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"
    };

    return [currentUserDisplayProfile, ...otherProfiles];
  }, [user, currentUserProfile, profiles]);

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
      
      <main className="px-4 lg:px-8 py-4 lg:py-6 space-y-3 lg:space-y-4 pb-20 lg:pb-8 max-w-7xl mx-auto">
        {/* Community Members Section - Horizontal Carousel */}
        <section className="mb-3 lg:mb-4">
          <div className="relative z-10">
            <SectionHeader 
              title={`${t('sections.neighbors')} ${totalUsersCount > 0 ? `(${totalUsersCount})` : ''}`} 
            />
          </div>
          {loading ? (
            <FastLoadingSkeleton type="profiles" />
          ) : (
            <div className="relative">
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40" dir="ltr" style={{scrollBehavior: 'smooth'}}>
                {user && <AddStoryButton className="flex-shrink-0" />}
                {displayProfiles.length > 0 ? (
                  displayProfiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      id={profile.id}
                      image={profile.image}
                      name={profile.name}
                      className="flex-shrink-0 min-w-[80px]"
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground w-full">No registered users yet</div>
                )}
              </div>
            </div>
          )}
        </section>


        {/* Join me Section - Horizontal Carousel */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-border/20 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">{t('sections.joinMe')}</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFriendMeetup(true)}
                className="text-xs px-2 py-1 rounded-full border border-black/20 bg-transparent text-foreground hover:border-black/30 gap-1"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/all-recommendations')}
                className="text-xs px-3 py-1"
              >
                All
              </Button>
            </div>
          </div>
          {loading ? (
            <FastLoadingSkeleton type="cards" count={3} />
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40" style={{scrollBehavior: 'smooth'}}>
                {recommendationItems.map((item, index) => (
                  <div key={`recommendation-${item.id}`} className="flex-shrink-0 w-48 lg:w-56">
                    <UniformCard
                      id={item.id}
                      image={item.image_url || coffeeShop}
                      video={(item as any).video_url}
                      title={item.title}
                      subtitle={item.location || 'Tel Aviv'}
                      date={item.created_at ? new Date(item.created_at).toLocaleDateString('en-US') : undefined}
                      type="business"
                      onClick={() => handleMarketplaceClick(item, 'recommendation', recommendationItems, index)}
                      showFavoriteButton={true}
                      uploader={item.uploader}
                      onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                      favoriteData={{
                        id: item.id,
                        title: item.title,
                        description: item.title,
                        image: item.image_url,
                        type: 'recommendation'
                      }}
                    />
                  </div>
                ))}
                {!user && recommendationItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground w-full">
                    <p>No items available at the moment</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Events Section - Horizontal Carousel */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-border/20 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">{t('events.title')}</h2>
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
            <div className="text-center py-8 text-muted-foreground">
              <p>No events available at the moment</p>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40" style={{scrollBehavior: 'smooth'}}>
                {realEvents.map((event) => (
                  <div key={`event-${event.id}`} className="flex-shrink-0 w-48 lg:w-56">
                    <UniformCard
                      id={event.id}
                      image={event.image_url || communityEvent}
                      video={(event as any).video_url}
                      title={event.title}
                      subtitle={event.location || 'Tel Aviv'}
                      date={event.date && event.time ? `${new Date(event.date).toLocaleDateString('en-US')} ${event.time}` : event.date ? new Date(event.date).toLocaleDateString('en-US') : undefined}
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Coupons Section - Horizontal Carousel Style */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-border/20 shadow-sm">
          <SectionHeader title="Coupons" />
          <div className="text-center py-8 text-muted-foreground">
            <p>No coupons available at the moment</p>
          </div>
        </section>



      </main>
      
      <FilterPopup 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      <EventPopup 
        isOpen={isEventPopupOpen}
        onClose={() => setIsEventPopupOpen(false)}
        eventId={selectedEvent?.id}
        event={selectedEvent}
      />


      <MarketplacePopup 
        isOpen={isMarketplacePopupOpen}
        onClose={() => setIsMarketplacePopupOpen(false)}
        item={selectedMarketplaceItem}
      />

      <NotificationsPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      <FriendMeetupPopup 
        isOpen={showFriendMeetup} 
        onClose={() => setShowFriendMeetup(false)} 
      />

      <CreateEventPopup 
        isOpen={showCreateEvent} 
        onClose={() => setShowCreateEvent(false)} 
        onEventCreated={() => {
          refetchEvents();
          refetch();
        }}
      />

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
