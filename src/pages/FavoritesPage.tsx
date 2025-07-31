import BottomNavigation from "@/components/BottomNavigation";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NotificationsPopup from "@/components/NotificationsPopup";
import EventPopup from "@/components/EventPopup";
import BusinessPopup from "@/components/BusinessPopup";
import MarketplacePopup from "@/components/MarketplacePopup";
import UniformCard from "@/components/UniformCard";
import { Button } from "@/components/ui/button";
import { Bell, ArrowLeft, Heart, Bookmark, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useFavorites } from "@/contexts/FavoritesContext";
import { useFriends } from "@/hooks/useFriends";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { friends, getFriendItems } = useFriends();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventPopupOpen, setIsEventPopupOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [isBusinessPopupOpen, setIsBusinessPopupOpen] = useState(false);
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState<any>(null);
  const [isMarketplacePopupOpen, setIsMarketplacePopupOpen] = useState(false);
  const [friendsItems, setFriendsItems] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFriendsItems = async () => {
      if (friends.length === 0) return;
      
      setLoading(true);
      const itemsData: { [key: string]: any[] } = {};
      
      for (const friend of friends) {
        const items = await getFriendItems(friend.friend_id);
        itemsData[friend.friend_id] = items;
      }
      
      setFriendsItems(itemsData);
      setLoading(false);
    };

    loadFriendsItems();
  }, [friends, getFriendItems]);

  const handleFavoriteClick = (favorite: any) => {
    if (favorite.type === 'business') {
      setSelectedBusiness(favorite.data);
      setIsBusinessPopupOpen(true);
    } else if (favorite.type === 'event') {
      setSelectedEvent(favorite.data);
      setIsEventPopupOpen(true);
    }
  };

  const handleItemClick = (item: any) => {
    navigate(`/item/${item.id}`);
  };

  // Calculate total items from all friends
  const totalFriendsItems = Object.values(friendsItems).reduce((total, items) => total + items.length, 0);

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Custom Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <Button variant="ghost" size="sm" onClick={() => setShowNotifications(true)}>
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold">חברים</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black font-nunito" style={{ color: '#BB31E9', textShadow: '0 0 2px rgba(187, 49, 233, 0.5)' }}>una</div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <main className="px-4 py-6">
        {friends.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">אין חברים עדיין</h2>
            <p className="text-gray-500">התחל להוסיף חברים על ידי לחיצה על כפתור ההוספה בפרופיל שלהם</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-center mb-2">החברים שלי</h1>
              <p className="text-center text-muted-foreground">{friends.length} חברים • {totalFriendsItems} פריטים</p>
            </div>

            {/* Friends and their items */}
            <div className="space-y-8">
              {friends.map((friend) => {
                const friendProfile = friend.profiles;
                const items = friendsItems[friend.friend_id] || [];
                
                return (
                  <div key={friend.friend_id} className="space-y-4">
                    {/* Friend Profile */}
                    <div 
                      className="flex items-center gap-3 p-4 bg-card rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => navigate(`/profile/${friend.friend_id}`)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={friendProfile?.profile_image_url} />
                        <AvatarFallback>{friendProfile?.name?.[0] || 'F'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{friendProfile?.name || 'משתמש'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {items.length} פריטים
                        </p>
                      </div>
                    </div>

                    {/* Friend's Items */}
                    {loading ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">טוען...</p>
                      </div>
                    ) : items.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {items.map((item) => (
                          <UniformCard
                            key={`${friend.friend_id}-${item.id}`}
                            id={item.id}
                            image={item.image_url}
                            title={item.title}
                            subtitle={item.description}
                            price={item.price}
                            type="marketplace"
                            onClick={() => handleItemClick(item)}
                            favoriteData={item}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>לחבר זה אין פריטים עדיין</p>
                      </div>
                    )}
                  </div>
                );
              })}
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