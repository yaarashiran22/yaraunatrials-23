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
import { useUserPosts } from "@/hooks/useUserPosts";
import SectionHeader from "@/components/SectionHeader";
import UniformCard from "@/components/UniformCard";
import AddItemPopup from "@/components/AddItemPopup";
import ProfilePictureViewer from "@/components/ProfilePictureViewer";
import { FeedImageViewer } from "@/components/FeedImageViewer";

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
  const { items: userItems, loading: itemsLoading, deleteItem, refetch: refetchItems } = useUserItems(actualProfileId);
  const { imagePosts, loading: postsLoading } = useUserPosts(actualProfileId);
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
  const [showProfilePicture, setShowProfilePicture] = useState(false);
  const [showFeedImages, setShowFeedImages] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleDeleteItem = async (itemId: string) => {
    // Require authentication
    if (!requireAuth()) {
      return;
    }

    // Verify user can delete this item
    const item = userItems.find(item => item.id === itemId);
    if (!item || !canUserModifyItem(user!.id, item.user_id)) {
      toast({
        title: "Authorization Error",
        description: "You don't have permission to delete this item",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this item?')) {
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
        title: "Authorization Error",
        description: "You don't have permission to edit this item",
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
      description: item.description || `${item.title} in excellent condition.`,
      seller: {
        name: profileData?.name || "User",
        image: profileData?.profile_image_url || profile1,
        location: item.location || profileData?.location || "Tel Aviv"
      },
      condition: "Like New",
      type: item.category
    };
    setSelectedItem(itemDetails);
    setIsItemPopupOpen(true);
  };

  // Filter items by category
  const secondHandItems = userItems.filter(item => item.category === 'secondhand' || !item.category);
  const eventItems = userItems.filter(item => item.category === 'event');
  const recommendationItems = userItems.filter(item => item.category === 'join me');
  const artItems = userItems.filter(item => item.category === 'art');

  // Listen for profile updates (when returning from edit page)
  useEffect(() => {
    const handleFocus = () => {
      refetch();
      refetchItems(); // Also refresh items when page regains focus
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch, refetchItems]);

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
    if (window.confirm('Are you sure you want to delete this message?')) {
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
      <div className="min-h-screen bg-background pb-20" dir="ltr">
        <Header 
          title="Profile"
          onNotificationsClick={() => setShowNotifications(true)}
        />
        <main className="px-4 py-6 pb-20">
          <div className="text-center">Loading...</div>
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
        <div className="min-h-screen bg-background pb-20" dir="ltr">
          <Header 
            title="Profile"
            onNotificationsClick={() => setShowNotifications(true)}
          />
          <main className="px-4 py-6 pb-20">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Please log in to view profile
              </p>
              <Button onClick={() => navigate('/login')}>
                Login
              </Button>
            </div>
          </main>
          <BottomNavigation />
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-background pb-20" dir="ltr">
        <Header 
          title="Profile"
          onNotificationsClick={() => setShowNotifications(true)}
        />
        <main className="px-4 py-6 pb-20">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {error || 'Profile not found'}
            </p>
            {isOwnProfile && (
              <Button onClick={() => navigate('/profile/edit')}>
                Create Profile
              </Button>
            )}
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20" dir="ltr">
      <Header 
        title="Profile"
        onNotificationsClick={() => setShowNotifications(true)}
      />

      <main className="px-4 py-6 pb-20">
        {/* Profile Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            <img 
              src={profileData?.profile_image_url || profile1}
              alt={profileData?.name || "User"}
              className="rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              style={{ width: '70px', height: '70px', minWidth: '70px', minHeight: '70px' }}
              onClick={() => setShowProfilePicture(true)}
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold mb-1">{profileData?.name || "User"}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'May 2024'}</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{profileData?.location || "Not specified"}</span>
              </div>
            </div>
            <p className="text-sm text-foreground mb-4">{profileData?.bio || "No description"}</p>
            {profileData?.specialties && profileData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {profileData.specialties.map((specialty, index) => (
                  <div key={index} className="rounded-lg px-3 py-2 inline-block" style={{ backgroundColor: 'hsl(280 60% 55%)' }}>
                    <span className="text-sm font-medium text-white">{specialty}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-3 text-sm">
              {profileData?.username ? (
                <a 
                  href={profileData.username} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 underline cursor-pointer"
                  style={{ color: 'hsl(280 60% 55%)' }}
                >
                  Social Page
                </a>
              ) : (
                <span className="text-muted-foreground">No Social Page</span>
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
                   {isFriend(actualProfileId || '') ? 'Added to friends' : 'Add'}
                 </Button>
               )}
               {isOwnProfile && (
                <Button variant="outline" size="sm" className="rounded-full px-3 py-1 h-7 text-xs" onClick={() => navigate('/profile/edit')}>
                   Edit
                 </Button>
               )}
            </div>
          </div>
        </div>

        {/* Interests Section - Only show if user has interests */}
        {profileData?.interests && profileData.interests.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.interests.map((interest, index) => (
                <div 
                  key={index} 
                  className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium"
                >
                  {interest}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Account Type Badge */}
        {profileData?.account_type && (
          <section className="mb-6">
            <div className="inline-flex items-center">
              <span 
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  profileData.account_type === 'business' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {profileData.account_type === 'business' ? 'Business' : 'Personal'}
              </span>
            </div>
          </section>
        )}

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
                <div key={`recommendation-${item.id}`} className="flex-shrink-0 w-32 lg:w-auto relative">
                  <UniformCard
                    id={item.id}
                    image={item.image_url || coffeeShop}
                    title={item.title}
                    subtitle={item.location || 'Tel Aviv'}
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
                  <p>No items available at the moment</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Events Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Events</h2>
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
                    No events yet
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
              Logout
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
      <ProfilePictureViewer
        isOpen={showProfilePicture}
        onClose={() => setShowProfilePicture(false)}
        imageUrl={profileData?.profile_image_url || ""}
        userName={profileData?.name || "User"}
        userId={actualProfileId}
      />
      <FeedImageViewer
        isOpen={showFeedImages}
        onClose={() => {
          setShowFeedImages(false);
          setSelectedImageId(null);
        }}
        images={imagePosts}
        initialImageId={selectedImageId}
      />
    </div>
  );
};

export default ProfilePage;