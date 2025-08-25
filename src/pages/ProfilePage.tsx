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
import { useUserEvents } from "@/hooks/useUserEvents";
import { useFriends } from "@/hooks/useFriends";
import { useProfile } from "@/hooks/useProfile";
import { useUserPosts } from "@/hooks/useUserPosts";
import SectionHeader from "@/components/SectionHeader";
import UniformCard from "@/components/UniformCard";
import AddItemPopup from "@/components/AddItemPopup";
import ProfilePictureViewer from "@/components/ProfilePictureViewer";
import { FeedImageViewer } from "@/components/FeedImageViewer";
import { useUserCommunities } from "@/hooks/useUserCommunities";

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
  const { events: userEvents, loading: eventsLoading, deleteEvent, refetch: refetchEvents } = useUserEvents(actualProfileId);
  const { imagePosts, loading: postsLoading } = useUserPosts(actualProfileId);
  const { addFriend, isFriend } = useFriends();
  const { messages, loading: messagesLoading, creating: creatingMessage, updating: updatingMessage, createMessage, updateMessage, deleteMessage } = useUserMessages(actualProfileId);
  const { communities: userCommunities, loading: communitiesLoading } = useUserCommunities(actualProfileId);
  
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

  const handleDeleteEvent = async (eventId: string) => {
    // Require authentication
    if (!requireAuth()) {
      return;
    }

    // Verify user can delete this event
    const event = userEvents.find(event => event.id === eventId);
    if (!event || !canUserModifyItem(user!.id, event.user_id)) {
      toast({
        title: "Authorization Error",
        description: "You don't have permission to delete this event",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(eventId);
    }
  };

  const handleEditEvent = (eventId: string) => {
    // Require authentication
    if (!requireAuth()) {
      return;
    }

    // Verify user can edit this event
    const event = userEvents.find(event => event.id === eventId);
    if (!event || !canUserModifyItem(user!.id, event.user_id)) {
      toast({
        title: "Authorization Error",
        description: "You don't have permission to edit this event",
        variant: "destructive",
      });
      return;
    }

    navigate(`/events/${eventId}/edit`);
  };

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
      refetchEvents(); // Also refresh events when page regains focus
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch, refetchItems, refetchEvents]);

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
                  <div key={index} className="bg-coral-50 text-coral-600 border border-coral-200 rounded-full px-2 py-1 inline-block" style={{ backgroundColor: 'hsl(16 100% 95%)', color: 'hsl(16 84% 47%)', borderColor: 'hsl(16 100% 88%)' }}>
                    <span className="text-xs font-medium">{specialty}</span>
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
                  Instagram
                </a>
              ) : (
                <span className="text-muted-foreground">No Instagram</span>
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

        {/* Communities Section - Show instead of interests */}
        {userCommunities && userCommunities.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Communities</h3>
            <div className="flex flex-wrap gap-2">
              {userCommunities.map((community) => (
                <div 
                  key={community.id} 
                  className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium flex items-center gap-2"
                >
                  {community.name}
                  {community.is_creator && (
                    <span className="text-xs bg-primary/20 rounded-full px-2 py-0.5">Creator</span>
                  )}
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

        {/* My Events Section - Only shown for own profile */}
        {isOwnProfile && userEvents && userEvents.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">My Events & Meetups</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/events/create')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userEvents.map((event) => (
                <div key={event.id} className="relative group">
                  <div 
                    className="bg-card rounded-lg border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <div className="aspect-video bg-muted">
                      <img 
                        src={event.image_url || communityEvent} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          event.event_type === 'meetup' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {event.event_type === 'meetup' ? 'Meetup' : 'Event'}
                        </span>
                        {event.date && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('en-US')}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-sm mb-2 line-clamp-2">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location || 'Location TBD'}</span>
                        </div>
                        {event.price && (
                          <span className="text-sm font-semibold text-primary">₪{event.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit/Delete buttons - show on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event.id);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-red-50 text-red-600 border-red-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state for events */}
        {isOwnProfile && userEvents && userEvents.length === 0 && !eventsLoading && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">My Events & Meetups</h3>
            </div>
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-4">You haven't created any events or meetups yet</p>
              <Button 
                onClick={() => navigate('/events/create')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Event
              </Button>
            </div>
          </section>
        )}

        {/* My Items Section - Only shown for own profile */}
        {isOwnProfile && userItems && userItems.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">My Items</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/items/new')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {userItems.map((item) => (
                <div key={item.id} className="relative group">
                  <div 
                    className="bg-card rounded-lg border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="aspect-square bg-muted">
                      <img 
                        src={item.image_url || dressItem} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm mb-1 truncate">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                      {item.price && (
                        <p className="text-sm font-semibold text-primary">₪{item.price}</p>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                          {item.category || 'Item'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit/Delete buttons - show on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem(item.id);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-red-50 text-red-600 border-red-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state for items */}
        {isOwnProfile && userItems && userItems.length === 0 && !itemsLoading && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">My Items</h3>
            </div>
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-4">You haven't added any items yet</p>
              <Button 
                onClick={() => navigate('/items/new')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Item
              </Button>
            </div>
          </section>
        )}

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