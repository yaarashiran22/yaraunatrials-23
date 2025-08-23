
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
      name: currentUserProfile.name || 'אתה',
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
      description: item.description || `${item.title} במצב מעולה.`,
      seller: {
        name: "יערה שיין",
        image: profile1,
        location: item.location || "תל אביב"
      },
      condition: "כמו חדש",
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
    <div className="min-h-screen bg-background" dir="rtl">
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
      
      <main className="px-4 lg:px-8 py-4 lg:py-6 space-y-5 lg:space-y-6 pb-20 lg:pb-8 max-w-7xl mx-auto">
        {/* Community Members Section - Special styling for better differentiation */}
        <section className="mb-8 lg:mb-10">
          <div className="relative z-10">
            <SectionHeader 
              title={`${t('sections.neighbors')} ${totalUsersCount > 0 ? `(${totalUsersCount})` : ''}`} 
            />
          </div>
          {loading ? (
            <FastLoadingSkeleton type="profiles" />
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-2" dir="rtl">
              {user && <AddStoryButton className="flex-shrink-0" />}
              {displayProfiles.length > 0 ? (
                displayProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    id={profile.id}
                    image={profile.image}
                    name={profile.name}
                    className="flex-shrink-0"
                  />
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground col-span-full">אין משתמשים רשומים עדיין</div>
              )}
            </div>
          )}
        </section>


        {/* Join me Section - Database Only */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-2 lg:p-2.5 border border-border/20 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">{t('sections.joinMe')}</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFriendMeetup(true)}
                className="text-xs px-2 py-1 rounded-full bg-background hover:bg-purple-50 border-purple-400 text-purple-600 hover:border-purple-500 gap-1"
               >
                <Plus className="h-3 w-3" />
                צור מפגש
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/all-recommendations')}
                className="text-xs px-3 py-1"
              >
                עוד
              </Button>
            </div>
          </div>
          {loading ? (
            <FastLoadingSkeleton type="cards" count={3} />
          ) : (
            <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-4 xl:grid-cols-6 lg:gap-6 pb-2 scrollbar-hide">
              {recommendationItems.map((item, index) => (
                <div key={`recommendation-${item.id}`} className="flex-shrink-0 w-36 lg:w-auto">
                  <UniformCard
                    id={item.id}
                    image={item.image_url || coffeeShop}
                    title={item.title}
                    subtitle={item.location || 'תל אביב'}
                    date={item.created_at ? new Date(item.created_at).toLocaleDateString('he-IL') : undefined}
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
                <div className="text-center py-8 text-muted-foreground">
                  <p>אין פריטים זמינים כרגע</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Events Section - Database Only */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-2 lg:p-2.5 border border-border/20 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">{t('events.title')}</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCreateEvent(true)}
                className="text-xs px-2 py-1 rounded-full bg-background hover:bg-purple-50 border-purple-400 text-purple-600 hover:border-purple-500 gap-1"
              >
                <Plus className="h-3 w-3" />
                צור אירוע
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/all-events')}
                className="text-xs px-3 py-1"
              >
                עוד
              </Button>
            </div>
          </div>
          {loading ? (
            <FastLoadingSkeleton type="cards" count={3} />
          ) : realEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>אין אירועים זמינים כרגע</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-4 xl:grid-cols-6 lg:gap-6 pb-2 scrollbar-hide">
              {realEvents.map((event) => (
                <div key={`event-${event.id}`} className="flex-shrink-0 w-36 lg:w-auto">
                  <UniformCard
                    id={event.id}
                    image={event.image_url || communityEvent}
                    title={event.title}
                    subtitle={event.location || 'תל אביב'}
                    date={event.date && event.time ? `${new Date(event.date).toLocaleDateString('he-IL')} ${event.time}` : event.date ? new Date(event.date).toLocaleDateString('he-IL') : undefined}
                    type="event"
                    uploader={event.uploader}
                    onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                    onClick={() => handleEventClick({
                      id: event.id,
                      title: event.title,
                      description: event.description || event.title,
                      date: event.date || 'תאריך יקבע בהמשך',
                      time: event.time || 'שעה תקבע בהמשך',
                      location: event.location || 'תל אביב',
                      price: event.price,
                      image: event.image_url || communityEvent,
                      organizer: {
                        name: event.uploader?.name || "מארגן האירוע",
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
          )}
        </section>

        {/* קופונים Section */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-2 lg:p-2.5 border border-border/20 shadow-sm">
          <SectionHeader title="קופונים" />
          <div className="text-center py-8 text-muted-foreground">
            <p>אין קופונים זמינים כרגע</p>
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
      
      <BottomNavigation />
    </div>
  );
};

export default Index;
