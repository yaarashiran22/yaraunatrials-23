
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
import SectionHeader from "@/components/SectionHeader";
import FastLoadingSkeleton from "@/components/FastLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNewItem } from "@/contexts/NewItemContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useOptimizedHomepage } from "@/hooks/useOptimizedHomepage";

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
  const { setRefreshCallback } = useNewItem();
  const { user } = useAuth();
  const { profile: currentUserProfile } = useProfile(user?.id);
  const navigate = useNavigate();
  
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

  const handleMarketplaceClick = useCallback((item: any, itemType?: string) => {
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
    setSelectedMarketplaceItem(itemDetails);
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
          <SectionHeader title={t('sections.joinMe')} viewAllPath="/recommended" />
          {loading ? (
            <FastLoadingSkeleton type="cards" count={3} />
          ) : (
            <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-4 xl:grid-cols-6 lg:gap-6 pb-2 scrollbar-hide">
              {recommendationItems.map((item) => (
                <div key={`recommendation-${item.id}`} className="flex-shrink-0 w-32 lg:w-auto">
                  <UniformCard
                    id={item.id}
                    image={item.image_url || coffeeShop}
                    title={item.title}
                    subtitle={item.location || 'תל אביב'}
                    type="business"
                    onClick={() => handleMarketplaceClick(item, 'recommendation')}
                    showFavoriteButton={true}
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
            <SectionHeader title={t('events.title')} />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/all-events')}
              className="text-xs px-3 py-1"
            >
              הצג את כל האירועים
            </Button>
          </div>
          {loading ? (
            <FastLoadingSkeleton type="cards" count={3} />
          ) : databaseEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>אין אירועים זמינים כרגע</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-4 xl:grid-cols-6 lg:gap-6 pb-2 scrollbar-hide">
              {databaseEvents.map((event) => (
                <div key={`db-event-${event.id}`} className="flex-shrink-0 w-36 lg:w-auto">
                  <UniformCard
                    id={event.id}
                    image={event.image_url || communityEvent}
                    title={event.title}
                    subtitle={event.location || 'תל אביב'}
                    type="event"
                    uploader={event.uploader}
                    onClick={() => handleEventClick({
                      id: event.id,
                      title: event.title,
                      description: event.title,
                      date: 'תאריך יקבע בהמשך',
                      time: 'שעה תקבע בהמשך',
                      location: event.location || 'תל אביב',
                      image: event.image_url || communityEvent,
                      organizer: {
                        name: event.uploader?.name || "מארגן האירוע",
                        image: event.uploader?.image || profile1
                      }
                    })}
                    favoriteData={{
                      id: event.id,
                      title: event.title,
                      description: event.title,
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
      
      <BottomNavigation />
    </div>
  );
};

export default Index;
