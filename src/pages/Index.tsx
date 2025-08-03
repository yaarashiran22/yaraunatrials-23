
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
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
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
  
  // Use optimized homepage hook with React Query caching
  const { 
    profiles, 
    marketplaceItems, 
    databaseEvents,
    recommendationItems, 
    artItems,
    businessItems,
    loading, 
    error,
    refetch,
    preloadData
  } = useOptimizedHomepage();

  // Removed preload useEffect that was causing infinite re-renders

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

  // Create display profiles with current user first if authenticated
  const displayProfiles = (() => {
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
  })();

  // All business, event, and artwork data now comes from the database
  // Static data has been removed to show only real content

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsEventPopupOpen(true);
  };

  const handleMarketplaceClick = (item: any, itemType?: string) => {
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
      type: itemType || 'marketplace' // Add type to identify recommendation items
    };
    setSelectedMarketplaceItem(itemDetails);
    setIsMarketplacePopupOpen(true);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header 
          title="בית"
          onNotificationsClick={() => setShowNotifications(true)}
        />
      </div>
      
      {/* Desktop Header */}
      <DesktopHeader 
        title="בית"
        onNotificationsClick={() => setShowNotifications(true)}
      />
      
      <main className="px-4 lg:px-8 py-4 lg:py-6 space-y-3 lg:space-y-4 pb-20 lg:pb-8 max-w-7xl mx-auto">
        {/* Community Members Section - Special styling for better differentiation */}
        <section className="bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm rounded-2xl p-2 lg:p-3 border border-primary/20 shadow-md">
          <div className="relative z-10">
            <SectionHeader title="שכנים וחברים" />
          </div>
          {loading ? (
            <LoadingSkeleton type="profiles" />
          ) : (
            <div className="flex gap-4 overflow-x-auto lg:grid lg:grid-cols-6 xl:grid-cols-8 lg:gap-6 pb-2 scrollbar-hide relative z-10" dir="rtl">
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
          <SectionHeader title="Join me" viewAllPath="/recommended" />
          {loading ? (
            <LoadingSkeleton type="cards" count={3} />
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
          <SectionHeader title="אירועים" viewAllPath="/events" />
          {loading ? (
            <LoadingSkeleton type="cards" count={3} />
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

        {/* Artists/Creators Section - Database Only */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-2 lg:p-2.5 border border-border/20 shadow-sm">
          <SectionHeader title="אמנים יוצרים" viewAllPath="/artists" />
          {loading ? (
            <LoadingSkeleton type="cards" count={3} />
          ) : artItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>אין פריטי אמנות זמינים כרגע</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-4 xl:grid-cols-6 lg:gap-6 pb-2 scrollbar-hide">
              {artItems.map((item) => (
                <div key={`art-${item.id}`} className="flex-shrink-0 w-36 lg:w-auto">
                  <UniformCard
                    id={item.id}
                    image={item.image_url || artPiece1}
                    title={item.title}
                    subtitle={item.location || 'תל אביב'}
                    type="business"
                    onClick={() => handleMarketplaceClick(item)}
                    favoriteData={{
                      id: item.id,
                      title: item.title,
                      description: item.title,
                      image: item.image_url,
                      type: 'art'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Marketplace Section - Database Only */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-2 lg:p-2.5 border border-border/20 shadow-sm">
          <SectionHeader title="למסירה" viewAllPath="/marketplace" />
          {loading ? (
            <LoadingSkeleton type="cards" count={4} />
          ) : marketplaceItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>אין פריטים למכירה כרגע</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-4 xl:grid-cols-6 lg:gap-6 pb-2 scrollbar-hide">
              {marketplaceItems.slice(0, 6).map((item) => (
                <div key={item.id} className="flex-shrink-0 w-36 lg:w-auto">
                  <UniformCard
                    id={item.id}
                    image={item.image_url || dressItem}
                    title={item.title}
                    subtitle={item.location || 'תל אביב'}
                    price={item.price ? `₪${item.price}` : undefined}
                    type="marketplace"
                    onClick={() => handleMarketplaceClick(item)}
                    favoriteData={{
                      id: item.id,
                      title: item.title,
                      description: item.title,
                      price: item.price,
                      image_url: item.image_url,
                      type: 'marketplace'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Popular Businesses Section - Database Only - Moved to Bottom */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-2 lg:p-2.5 border border-border/20 shadow-sm">
          <SectionHeader title="שאלות שכנים" viewAllPath="/recommended" />
          {loading ? (
            <LoadingSkeleton type="cards" count={3} />
          ) : (
            <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-4 xl:grid-cols-6 lg:gap-6 pb-2 scrollbar-hide">
              {businessItems.map((item) => (
                <div key={`business-${item.id}`} className="flex-shrink-0 w-32 lg:w-auto">
                  <UniformCard
                    id={item.id}
                    image={item.image_url || coffeeShop}
                    title={item.title}
                    subtitle={item.location || 'תל אביב'}
                    type="business"
                    onClick={() => handleMarketplaceClick(item, 'business')}
                    showFavoriteButton={true}
                    favoriteData={{
                      id: item.id,
                      title: item.title,
                      description: item.title,
                      image: item.image_url,
                      type: 'business'
                    }}
                  />
                </div>
              ))}
              {!user && businessItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>אין עסקים זמינים כרגע</p>
                </div>
              )}
            </div>
          )}
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
