import BottomNavigation from "@/components/BottomNavigation";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NotificationsPopup from "@/components/NotificationsPopup";
import EventPopup from "@/components/EventPopup";
import BusinessPopup from "@/components/BusinessPopup";
import MarketplacePopup from "@/components/MarketplacePopup";
import UniformCard from "@/components/UniformCard";
import { Button } from "@/components/ui/button";
import { Bell, ArrowLeft, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useFavorites } from "@/contexts/FavoritesContext";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventPopupOpen, setIsEventPopupOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [isBusinessPopupOpen, setIsBusinessPopupOpen] = useState(false);
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState<any>(null);
  const [isMarketplacePopupOpen, setIsMarketplacePopupOpen] = useState(false);


  const handleFavoriteClick = (favorite: any) => {
    if (favorite.type === 'business') {
      setSelectedBusiness(favorite.data);
      setIsBusinessPopupOpen(true);
    } else if (favorite.type === 'event') {
      setSelectedEvent(favorite.data);
      setIsEventPopupOpen(true);
    }
  };

  // Calculate total items
  const totalFavorites = favorites.length;

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Custom Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <Button variant="ghost" size="sm" onClick={() => setShowNotifications(true)}>
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span className="text-lg font-bold">המועדפים שלי</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black font-nunito" style={{ color: '#BB31E9', textShadow: '0 0 2px rgba(187, 49, 233, 0.5)' }}>una</div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <main className="px-4 py-6">
        {totalFavorites === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">אין פריטים מועדפים</h2>
            <p className="text-gray-500">התחל להוסיף פריטים למועדפים שלך על ידי לחיצה על הלב</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-center mb-2">המועדפים שלי</h1>
              <p className="text-center text-muted-foreground">{totalFavorites} פריטים מועדפים</p>
            </div>

            {/* All Favorites Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Favorites (Businesses and Events) */}
              {favorites.map((favorite) => (
                <div key={`favorite-${favorite.id}-${favorite.type}`} className="relative">
                  <UniformCard
                    id={favorite.id}
                    image={favorite.image}
                    title={favorite.title}
                    subtitle={favorite.subtitle}
                    price={favorite.price}
                    type={favorite.type as 'business' | 'event'}
                    onClick={() => handleFavoriteClick(favorite)}
                    favoriteData={favorite.data}
                  />
                  {/* Type indicator */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-1 bg-accent/90 text-accent-foreground text-xs rounded-full">
                      {favorite.type === 'business' ? 'עסק' : 'אירוע'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Popups */}
      <EventPopup 
        isOpen={isEventPopupOpen}
        onClose={() => setIsEventPopupOpen(false)}
        event={selectedEvent}
      />

      <BusinessPopup 
        isOpen={isBusinessPopupOpen}
        onClose={() => setIsBusinessPopupOpen(false)}
        business={selectedBusiness}
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

export default FavoritesPage;