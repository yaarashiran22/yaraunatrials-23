import { ArrowLeft, MapPin, Copy, Plus, ChevronLeft, Bell, Settings, LogOut, Trash2, Pencil, MessageSquare, Edit3, Bookmark, Gift } from "lucide-react";
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
import { useUserEvents } from "@/hooks/useUserEvents";
import { useFriends } from "@/hooks/useFriends";
import { useFollowing } from "@/hooks/useFollowing";
import { useProfile } from "@/hooks/useProfile";
import { useUserPosts } from "@/hooks/useUserPosts";
import { getRelativeDay } from "@/utils/dateUtils";
import SectionHeader from "@/components/SectionHeader";
import UniformCard from "@/components/UniformCard";
import ProfilePictureViewer from "@/components/ProfilePictureViewer";
import { FeedImageViewer } from "@/components/FeedImageViewer";
import EditEventPopup from "@/components/EditEventPopup";
import { EditCouponModal } from "@/components/EditCouponModal";

import { useMyCoupons } from "@/hooks/useUserCoupons";

import profile1 from "@/assets/profile-1.jpg";
import communityEvent from "@/assets/community-event.jpg";

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
  const { events: userEvents, loading: eventsLoading, deleteEvent, refetch: refetchEvents } = useUserEvents(actualProfileId);
  const { imagePosts, loading: postsLoading } = useUserPosts(actualProfileId);
  const { addFriend, isFriend } = useFriends();
  const { isFollowing, toggleFollow, isToggling } = useFollowing();
  const { myCoupons, loading: couponsLoading, deleteCoupon, deleting: deletingCoupon, refreshCoupons } = useMyCoupons(user?.id);
  const { messages, loading: messagesLoading, creating: creatingMessage, updating: updatingMessage, createMessage, updateMessage, deleteMessage } = useUserMessages(actualProfileId);
  
  // Check if this is the current user's profile
  // If the ID is invalid or missing, we're showing the current user's profile
  const isOwnProfile = user && (!id || !validateUUID(id) || actualProfileId === user.id);

  console.log('ProfilePage - Debug info:', {
    urlId: id,
    actualProfileId,
    currentUserId: user?.id,
    isOwnProfile,
    isValidUUID: id ? validateUUID(id) : false
  });
  
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [showProfilePicture, setShowProfilePicture] = useState(false);
  const [showFeedImages, setShowFeedImages] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<any>(null);
  const [showEditCoupon, setShowEditCoupon] = useState(false);
  const [selectedCouponForEdit, setSelectedCouponForEdit] = useState<any>(null);

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

    setSelectedEventForEdit(event);
    setShowEditEvent(true);
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!requireAuth()) return;

    const coupon = myCoupons.find(c => c.id === couponId);
    if (!coupon || !canUserModifyItem(user!.id, coupon.user_id)) {
      toast({
        title: "Authorization Error",
        description: "You don't have permission to delete this coupon",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteCoupon(couponId);
    }
  };

  const handleEditCoupon = (couponId: string) => {
    if (!requireAuth()) return;

    const coupon = myCoupons.find(c => c.id === couponId);
    if (!coupon || !canUserModifyItem(user!.id, coupon.user_id)) {
      toast({
        title: "Authorization Error",
        description: "You don't have permission to edit this coupon",
        variant: "destructive",
      });
      return;
    }

    setSelectedCouponForEdit(coupon);
    setShowEditCoupon(true);
  };

  // Listen for profile updates (when returning from edit page)
  useEffect(() => {
    const handleFocus = () => {
      refetch();
      refetchEvents(); // Also refresh events when page regains focus
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch, refetchEvents]);

  // Also refetch when returning from navigation
  useEffect(() => {
    refetch();
  }, [id, user?.id]);

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
              src={profileData?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
              alt={profileData?.name || "User"}
              className="rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              style={{ width: '70px', height: '70px', minWidth: '70px', minHeight: '70px' }}
              onClick={() => setShowProfilePicture(true)}
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold mb-1">{profileData?.name || "User"}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{profileData?.location || "Not specified"}</span>
              </div>
            </div>
            <p className="text-sm text-foreground mb-4">{profileData?.bio || "No description"}</p>
            {profileData?.specialties && profileData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {profileData.specialties.map((specialty, index) => (
                  <div key={index} className="rounded-full px-2 py-1 inline-block" style={{ backgroundColor: 'hsl(var(--coral-muted))', color: 'hsl(var(--coral))', borderColor: 'hsl(var(--coral))' }}>
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
                 <div className="flex gap-2">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className={`rounded-full px-3 py-1 h-7 text-xs ${isFriend(actualProfileId || '') ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' : ''}`}
                     onClick={handleAddFriend}
                   >
                     {isFriend(actualProfileId || '') ? 'Added to friends' : 'Add'}
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className={`rounded-full px-3 py-1 h-7 text-xs ${isFollowing(actualProfileId || '') ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' : ''}`}
                     onClick={() => actualProfileId && toggleFollow(actualProfileId)}
                     disabled={isToggling}
                   >
                     {isFollowing(actualProfileId || '') ? 'Following' : 'Follow'}
                   </Button>
                 </div>
               )}
               {isOwnProfile && (
                <Button variant="outline" size="sm" className="rounded-full px-3 py-1 h-7 text-xs" onClick={() => navigate('/profile/edit')}>
                   Edit
                 </Button>
               )}
            </div>
          </div>
        </div>


        {/* Account Type Badge and Business Features */}
        {profileData?.account_type && (
          <section className="mb-6">
            <div className="flex items-center justify-between">
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
              
              {/* Business Account Features - Show manage button only when no coupons */}
              {profileData.account_type === 'business' && isOwnProfile && (!myCoupons || myCoupons.length === 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile/' + user?.id + '#coupons')}
                  className="gap-2 border-purple-400 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                >
                  <Gift className="h-4 w-4" />
                  Manage Coupons
                </Button>
              )}
            </div>
            {/* Business Coupons Display */}
            {profileData.account_type === 'business' && isOwnProfile && myCoupons && myCoupons.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-purple-700">Business Coupons</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myCoupons.slice(0, 4).map((coupon) => (
                    <div key={coupon.id} className="relative group">
                      <div className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
                        {coupon.image_url && (
                          <div className="aspect-video bg-muted">
                            <img 
                              src={coupon.image_url} 
                              alt={coupon.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Gift className="h-3 w-3 text-primary" />
                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                              Coupon
                            </span>
                            {coupon.valid_until && (
                              <span className="text-xs text-muted-foreground">
                                Valid until {new Date(coupon.valid_until).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <h5 className="font-medium text-sm mb-1">{coupon.title}</h5>
                          {coupon.business_name && (
                            <p className="text-xs text-primary font-medium mb-1">{coupon.business_name}</p>
                          )}
                          {coupon.discount_amount && (
                            <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full inline-block mb-2 font-semibold">
                              {coupon.discount_amount}
                            </div>
                          )}
                          {coupon.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{coupon.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            {coupon.neighborhood && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-2 w-2" />
                                <span>{coupon.neighborhood}</span>
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {coupon.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Edit/Delete buttons - show on hover */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCoupon(coupon.id);
                          }}
                        >
                          <Pencil className="h-2 w-2" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-6 w-6 p-0 bg-white/90 hover:bg-red-50 text-red-600 border-red-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCoupon(coupon.id);
                          }}
                          disabled={deletingCoupon}
                        >
                          <Trash2 className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {myCoupons.length > 4 && (
                  <div className="mt-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/profile/' + user?.id + '#coupons')}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      View all {myCoupons.length} coupons
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* My Events Section - Only shown for own profile */}
        {isOwnProfile && userEvents && userEvents.length > 0 && (
          <section className="mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">My Events & Meetups</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userEvents.map((event) => (
                <div key={event.id} className="relative group">
                  <div 
                    className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-muted">
                      {(event as any).video_url ? (
                        <video 
                          src={(event as any).video_url}
                          className="w-full h-full object-cover"
                          muted
                          autoPlay
                          loop
                          playsInline
                          preload="metadata"
                          poster={event.image_url || communityEvent}
                          onLoadedData={(e) => {
                            // Ensure video plays when loaded
                            e.currentTarget.play().catch(() => {
                              console.log('Autoplay blocked, video will play on user interaction');
                            });
                          }}
                          onError={(e) => {
                            // If video fails to load, hide the video element and show fallback image
                            e.currentTarget.style.display = 'none';
                            console.log('Video failed to load:', (event as any).video_url);
                          }}
                        />
                      ) : (
                        <img 
                          src={event.image_url || communityEvent} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      )}
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
                            {getRelativeDay(event.date)}
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
      <EditEventPopup 
        isOpen={showEditEvent}
        onClose={() => {
          setShowEditEvent(false);
          setSelectedEventForEdit(null);
        }}
        eventData={selectedEventForEdit}
        onSuccess={() => {
          refetchEvents();
          setShowEditEvent(false);
          setSelectedEventForEdit(null);
        }}
      />
      <EditCouponModal
        isOpen={showEditCoupon}
        onClose={() => {
          setShowEditCoupon(false);
          setSelectedCouponForEdit(null);
        }}
        coupon={selectedCouponForEdit}
        onUpdate={() => {
          refreshCoupons();
          setShowEditCoupon(false);
          setSelectedCouponForEdit(null);
        }}
      />
    </div>
  );
};

export default ProfilePage;