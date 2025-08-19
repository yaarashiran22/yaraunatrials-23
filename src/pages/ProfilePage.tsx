import { ArrowLeft, MapPin, Copy, Plus, ChevronLeft, Bell, Settings, LogOut, Trash2, Pencil, MessageSquare, Edit3, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserMessages } from "@/hooks/useUserMessages";
import { validateUUID, canUserModifyItem } from "@/utils/security";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import NotificationsPopup from "@/components/NotificationsPopup";
import MarketplacePopup from "@/components/MarketplacePopup";
import { useUserItems } from "@/hooks/useUserItems";
import { useFriends } from "@/hooks/useFriends";
import { useProfile } from "@/hooks/useProfile";
import SectionHeader from "@/components/SectionHeader";
import UniformCard from "@/components/UniformCard";
import AddItemPopup from "@/components/AddItemPopup";

import profile1 from "@/assets/profile-1.jpg";
import dressItem from "@/assets/dress-item.jpg";
import furnitureItem from "@/assets/furniture-item.jpg";
import communityEvent from "@/assets/community-event.jpg";
import coffeeShop from "@/assets/coffee-shop.jpg";
import vintageStore from "@/assets/vintage-store.jpg";
import artPiece1 from "@/assets/canvas-art-1.jpg";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, requireAuth, canAccessResource } = useSecureAuth();
  const { toast } = useToast();
  
  // Use security utility for UUID validation
  
  // Handle profile ID logic: if no ID or invalid ID, use current user's profile
  const getActualProfileId = () => {
    if (!id || !validateUUID(id)) {
      return user?.id;
    }
    return id;
  };
  
  const actualProfileId = getActualProfileId();
  const { profile: profileData, loading, error, refetch } = useProfile(actualProfileId);
  const { items: userItems, loading: itemsLoading, deleteItem } = useUserItems(actualProfileId);
  const { addFriend, isFriend } = useFriends();
  const { messages, loading: messagesLoading, creating: creatingMessage, updating: updatingMessage, createMessage, updateMessage, deleteMessage } = useUserMessages(actualProfileId);
  
  // Check if this is the current user's profile
  const isOwnProfile = user && (!id || !validateUUID(id) || id === user.id);
  
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isItemPopupOpen, setIsItemPopupOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState("");

  const handleDeleteItem = async (itemId: string) => {
    // Require authentication
    if (!requireAuth()) {
      return;
    }

    // Verify user can delete this item
    const item = userItems.find(item => item.id === itemId);
    if (!item || !canUserModifyItem(user!.id, item.user_id)) {
      toast({
        title: "שגיאת הרשאה",
        description: "אין לך הרשאה למחוק פריט זה",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm('האם אתה בטוח שברצונך למחוק את הפריט?')) {
      await deleteItem(itemId);
    }
  };

  const handleEditItem = (itemId: string) => {
    // Require authentication
    if (!requireAuth()) {
      return;
    }

    // Verify user can edit this item
    const item = userItems.find(item => item.id === itemId);
    if (!item || !canUserModifyItem(user!.id, item.user_id)) {
      toast({
        title: "שגיאת הרשאה",
        description: "אין לך הרשאה לערוך פריט זה",
        variant: "destructive",
      });
      return;
    }

    navigate(`/items/${itemId}/edit`);
  };

  const handleItemClick = (item: any) => {
    const itemDetails = {
      id: item.id,
      title: item.title,
      image: item.image_url || dressItem,
      price: item.price ? `₪${item.price}` : undefined,
      description: item.description || `${item.title} במצב מעולה.`,
      seller: {
        name: profileData?.name || "משתמש",
        image: profileData?.profile_image_url || profile1,
        location: item.location || profileData?.location || "תל אביב"
      },
      condition: "כמו חדש",
      type: item.category
    };
    setSelectedItem(itemDetails);
    setIsItemPopupOpen(true);
  };

  // Filter items by category
  const secondHandItems = userItems.filter(item => item.category === 'secondhand' || !item.category);
  const eventItems = userItems.filter(item => item.category === 'event');
  const recommendationItems = userItems.filter(item => item.category === 'recommendation');
  const artItems = userItems.filter(item => item.category === 'art');

  // Listen for profile updates (when returning from edit page)
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  // Also refetch when returning from navigation
  useEffect(() => {
    console.log('ProfilePage: URL id:', id, 'user.id:', user?.id, 'actualProfileId:', actualProfileId);
    refetch();
  }, [id, user?.id, actualProfileId, refetch]);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim()) return;
    
    const success = await createMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  const handleEditMessage = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setEditingMessageText(currentText);
  };

  const handleUpdateMessage = async () => {
    if (!editingMessageId || !editingMessageText.trim()) return;
    
    const success = await updateMessage(editingMessageId, editingMessageText);
    if (success) {
      setEditingMessageId(null);
      setEditingMessageText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingMessageText("");
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את ההודעה?')) {
      await deleteMessage(messageId);
    }
  };

  const handleAddFriend = async () => {
    if (!actualProfileId || isOwnProfile) return;
    
    const success = await addFriend(actualProfileId);
    if (success) {
      // Friend added successfully
    }
  };


  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20" dir="rtl">
        <Header 
          title="פרופיל"
          onNotificationsClick={() => setShowNotifications(true)}
        />
        <main className="px-4 py-6 pb-20">
          <div className="text-center">טוען...</div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  // Show error state
  if (error || !profileData) {
    // If no user is authenticated and no valid profile ID, redirect to login
    if (!user && (!actualProfileId || !validateUUID(actualProfileId))) {
      return (
        <div className="min-h-screen bg-background pb-20" dir="rtl">
          <Header 
            title="פרופיל"
            onNotificationsClick={() => setShowNotifications(true)}
          />
          <main className="px-4 py-6 pb-20">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                יש להתחבר כדי לצפות בפרופיל
              </p>
              <Button onClick={() => navigate('/login')}>
                התחבר
              </Button>
            </div>
          </main>
          <BottomNavigation />
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-background pb-20" dir="rtl">
        <Header 
          title="פרופיל"
          onNotificationsClick={() => setShowNotifications(true)}
        />
        <main className="px-4 py-6 pb-20">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {error || 'לא נמצא פרופיל'}
            </p>
            {isOwnProfile && (
              <Button onClick={() => navigate('/profile/edit')}>
                צור פרופיל
              </Button>
            )}
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <Header 
        title="פרופיל"
        onNotificationsClick={() => setShowNotifications(true)}
      />

      <main className="px-4 py-6 pb-20">
        {/* Profile Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            <img 
              src={profileData?.profile_image_url || profile1}
              alt={profileData?.name || "משתמש"}
              className="rounded-full object-cover"
              style={{ width: '70px', height: '70px', minWidth: '70px', minHeight: '70px' }}
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold mb-1">{profileData?.name || "משתמש"}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' }) : 'מאי 2024'}</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{profileData?.location || "לא צוין"}</span>
              </div>
            </div>
            <p className="text-sm text-foreground mb-4">{profileData?.bio || "אין תיאור"}</p>
            {profileData?.specialty && (
              <div className="rounded-lg px-3 py-2 mb-4 inline-block" style={{ backgroundColor: 'hsl(280 60% 65%)' }}>
                <span className="text-sm font-medium text-white">{profileData.specialty}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 text-sm">
              {profileData?.username ? (
                <a 
                  href={profileData.username} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline cursor-pointer"
                >
                  עמוד סושיאל
                </a>
              ) : (
                <span className="text-muted-foreground">אין עמוד סושיאל</span>
              )}
              {isOwnProfile && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full p-2 h-8 w-8"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
               {!isOwnProfile && (
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className={`rounded-full px-3 py-1 h-7 text-xs ${isFriend(actualProfileId || '') ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' : ''}`}
                   onClick={handleAddFriend}
                 >
                   {isFriend(actualProfileId || '') ? 'נוסף לחברים' : 'הוספה'}
                 </Button>
               )}
              {isOwnProfile && (
                <>
                  <Button variant="outline" size="sm" className="rounded-full px-3 py-1 h-7 text-xs" onClick={() => navigate('/profile/edit')}>
                    עריכה
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full p-2 h-8 w-8"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Join me Section */}
        <section className="mb-8">
          <SectionHeader title="Join me" />
          {itemsLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {Array(3).fill(null).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-32 lg:w-auto">
                  <div className="bg-muted rounded-xl h-32 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-4 xl:grid-cols-6 lg:gap-6 pb-2 scrollbar-hide">
              {recommendationItems.map((item) => (
                <div key={`join-me-${item.id}`} className="flex-shrink-0 w-32 lg:w-auto relative">
                  <UniformCard
                    id={item.id}
                    image={item.image_url || coffeeShop}
                    title={item.title}
                    subtitle={item.location || 'תל אביב'}
                    type="business"
                    onClick={() => handleItemClick(item)}
                    showFavoriteButton={false}
                    favoriteData={{
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      image: item.image_url,
                      type: 'recommendation'
                    }}
                  />
                  {/* Edit and Delete buttons - only show for own profile */}
                  {isOwnProfile && (
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="p-1 h-7 w-7 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 border-2 border-white"
                        onClick={() => handleEditItem(item.id)}
                      >
                        <Pencil className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="p-1 h-7 w-7 rounded-full shadow-lg bg-red-500 hover:bg-red-600 border-2 border-white"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {recommendationItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground w-full">
                  <p>אין פריטים זמינים כרגע</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* אירועים Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">אירועים</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            <div className="flex gap-6">
              {itemsLoading ? (
                // Loading skeleton
                <div className="flex gap-6">
                  {Array(2).fill(null).map((_, index) => (
                    <div key={index} className="flex-shrink-0 w-36 h-24 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : eventItems.length > 0 ? (
                eventItems.map((item) => (
                  <div key={item.id} className="relative flex-shrink-0 w-36 mb-2">
                    <img 
                      src={item.image_url || communityEvent} 
                      alt={item.title}
                      className="w-36 h-24 rounded-lg object-cover cursor-pointer"
                      onClick={() => handleItemClick(item)}
                    />
                    {/* Edit and Delete buttons - only show for own profile */}
                    {isOwnProfile && (
                      <div className="absolute bottom-1 right-1 flex gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="p-1 h-7 w-7 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 border-2 border-white"
                          onClick={() => handleEditItem(item.id)}
                        >
                          <Pencil className="h-4 w-4 text-white" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="p-1 h-7 w-7 rounded-full shadow-lg bg-red-500 hover:bg-red-600 border-2 border-white"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                !isOwnProfile && (
                  <div className="text-center text-muted-foreground py-8">
                    אין אירועים עדיין
                  </div>
                )
              )}
            </div>
            <div className="flex-shrink-0 flex items-center">
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </section>


        {/* Logout Button */}
        {isOwnProfile && (
          <div className="mt-8 pt-6 border-t border-border">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4" />
              התנתקות
            </Button>
          </div>
        )}
      </main>
      
      <BottomNavigation />
      <NotificationsPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      <AddItemPopup 
        isOpen={showAddItem} 
        onClose={() => setShowAddItem(false)} 
      />
      <MarketplacePopup 
        isOpen={isItemPopupOpen}
        onClose={() => setIsItemPopupOpen(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default ProfilePage;