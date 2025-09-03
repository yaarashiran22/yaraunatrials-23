import { Calendar, MapPin, Users, Trash2, Pencil, Edit, X, Star, Heart, MessageCircle, Share2, Bell, ChevronLeft, ChevronRight, Play, Pause, Instagram, Settings, Gift, Plus, LogOut, Sparkles, Zap, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
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
import { InstagramStoryPopup } from "@/components/InstagramStoryPopup";
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
import { supabase } from "@/integrations/supabase/client";

import { useMyCoupons } from "@/hooks/useUserCoupons";

import profile1 from "@/assets/profile-1.jpg";
import communityEvent from "@/assets/community-event.jpg";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, requireAuth, canAccessResource } = useSecureAuth();
  const { toast } = useToast();
  
  // Use security utility for UUID validation - memoized to prevent re-renders
  const actualProfileId = useMemo(() => {
    if (!id || !validateUUID(id)) {
      return user?.id;
    }
    return id;
  }, [id, user?.id]);
  
  // Check if this is the current user's profile - memoized
  const isOwnProfile = useMemo(() => {
    return user && (!id || !validateUUID(id) || actualProfileId === user.id);
  }, [user, id, actualProfileId]);
  
  const { profile: profileData, loading, error, refetch } = useProfile(actualProfileId);
  const { events: userEvents, loading: eventsLoading, deleteEvent, refetch: refetchEvents } = useUserEvents(actualProfileId);
  const { imagePosts, loading: postsLoading } = useUserPosts(actualProfileId);
  const { addFriend, isFriend } = useFriends();
  const { isFollowing, toggleFollow, isToggling } = useFollowing();
  const { myCoupons, loading: couponsLoading, deleteCoupon, deleting: deletingCoupon, refreshCoupons } = useMyCoupons(user?.id);
  const { messages, loading: messagesLoading, creating: creatingMessage, updating: updatingMessage, createMessage, updateMessage, deleteMessage } = useUserMessages(actualProfileId);
  
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStoryPopup, setShowStoryPopup] = useState(false);
  const [generatedStoryUrl, setGeneratedStoryUrl] = useState<string | null>(null);
  const [generatingStory, setGeneratingStory] = useState(false);
  const [currentEventTitle, setCurrentEventTitle] = useState("");
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

  // All the existing functions...
  const generateInstagramStory = async (eventData: any) => {
    try {
      setGeneratingStory(true);
      setCurrentEventTitle(eventData.title);
      // Simulate story generation delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // For demo, just use event image or a placeholder
      setGeneratedStoryUrl(eventData.image_url || communityEvent);
      setShowStoryPopup(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate Instagram story.",
        variant: "destructive",
      });
    } finally {
      setGeneratingStory(false);
    }
  };

  const generateCouponInstagramStory = async (couponData: any) => {
    try {
      setGeneratingStory(true);
      setCurrentEventTitle(couponData.title);
      // Simulate story generation delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // For demo, just use coupon image or a placeholder
      setGeneratedStoryUrl(couponData.image_url || "/lovable-uploads/coupon-placeholder.png");
      setShowStoryPopup(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate coupon Instagram story.",
        variant: "destructive",
      });
    } finally {
      setGeneratingStory(false);
    }
  };

  const handleEditEvent = async (eventId: string) => {
    const eventToEdit = userEvents.find((e) => e.id === eventId);
    if (eventToEdit) {
      setSelectedEventForEdit(eventToEdit);
      setShowEditEvent(true);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(eventId);
      refetchEvents();
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      await deleteCoupon(couponId);
      refreshCoupons();
    }
  };

  const handleEditCoupon = (couponId: string) => {
    const couponToEdit = myCoupons.find((c) => c.id === couponId);
    if (couponToEdit) {
      setSelectedCouponForEdit(couponToEdit);
      setShowEditCoupon(true);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/30 to-secondary/20 pb-20" dir="ltr">
      <Header 
        title=""
        onNotificationsClick={() => setShowNotifications(true)}
      />

      <main className="pb-20 relative">
        {/* Creative Hero Section */}
        <div className="relative px-0 pt-0 pb-8 mb-8 overflow-hidden">
          {/* Artistic Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-coral/15 to-primary/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-coral/30 to-transparent rounded-full blur-2xl"></div>
          
          {/* Geometric Accents */}
          <div className="absolute top-12 right-8 w-16 h-16 border-2 border-accent/30 rotate-45 rounded-lg"></div>
          <div className="absolute bottom-16 left-12 w-8 h-8 bg-coral/40 rounded-full"></div>
          <div className="absolute top-32 left-6 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
          
          <div className="relative z-10 px-6 pt-8">
            {/* Profile Header */}
            <div className="flex items-start gap-6 mb-8">
              <div className="relative group">
                {/* Artistic Profile Ring */}
                <div className="absolute -inset-3 bg-gradient-to-r from-accent via-coral to-accent rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-coral via-accent to-coral rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                
                <div className="relative bg-white p-1 rounded-full shadow-2xl">
                  <img 
                    src={profileData?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                    alt={profileData?.name || "User"}
                    className="w-24 h-24 rounded-full object-cover cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg"
                    onClick={() => setShowProfilePicture(true)}
                  />
                  {isOwnProfile && (
                    <div className="absolute -bottom-1 -right-1 bg-accent text-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform cursor-pointer">
                      <Camera className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 pt-2">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="font-playfair text-3xl font-bold mb-1 text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      {profileData?.name || "User"}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="font-outfit text-sm font-medium">{profileData?.location || "Somewhere cool"}</span>
                    </div>
                  </div>
                  
                  {isOwnProfile && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white shadow-lg font-outfit"
                      onClick={() => navigate('/settings')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  )}
                </div>
                
                <p className="font-outfit text-foreground/80 mb-6 leading-relaxed">
                  {profileData?.bio || "Living life, creating moments ✨"}
                </p>

                {/* Skills/Specialties with Creative Design */}
                {profileData?.specialties && profileData.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {profileData.specialties.map((specialty, index) => (
                      <div 
                        key={index} 
                        className="relative group overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-coral/20 rounded-full blur-sm group-hover:blur-none transition-all duration-300"></div>
                        <div className="relative px-4 py-2 bg-white/90 backdrop-blur-sm border border-accent/20 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                          <span className="font-outfit text-sm font-medium text-accent">#{specialty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {profileData?.username && (
                    <a 
                      href={profileData.username} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-outfit font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </a>
                  )}
                  
                  {!isOwnProfile && (
                    <div className="flex gap-3">
                      <Button 
                        size="sm" 
                        className={`rounded-full px-6 py-2 font-outfit font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
                          isFriend(actualProfileId || '') 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
                            : 'bg-white text-accent border-2 border-accent/20 hover:bg-accent hover:text-white'
                        }`}
                        onClick={handleAddFriend}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {isFriend(actualProfileId || '') ? 'Friends' : 'Add Friend'}
                      </Button>
                      <Button 
                        size="sm" 
                        className={`rounded-full px-6 py-2 font-outfit font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
                          isFollowing(actualProfileId || '') 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                            : 'bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-600 hover:text-white'
                        }`}
                        onClick={() => actualProfileId && toggleFollow(actualProfileId)}
                        disabled={isToggling}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        {isFollowing(actualProfileId || '') ? 'Following' : 'Follow'}
                      </Button>
                    </div>
                  )}
                  
                  {isOwnProfile && (
                    <Button 
                      size="sm" 
                      className="rounded-full px-6 py-2 bg-white text-accent border-2 border-accent/20 hover:bg-accent hover:text-white font-outfit font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                      onClick={() => navigate('/profile/edit')}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-8">
          {/* Account Type with Creative Design */}
          {profileData?.account_type && (
            <section className="relative">
              <div className="relative bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`px-6 py-3 rounded-2xl font-outfit font-bold text-white shadow-lg ${
                      profileData.account_type === 'business' 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    }`}>
                      {profileData.account_type === 'business' ? '🏢 Business' : '✨ Personal'}
                    </div>
                    <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                  </div>
                  
                  {/* Business Coupons */}
                  {profileData.account_type === 'business' && isOwnProfile && myCoupons && myCoupons.length > 0 && (
                    <div>
                      <h4 className="font-playfair text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <Gift className="w-7 h-7 text-coral" />
                        Special Offers
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myCoupons.slice(0, 4).map((coupon) => (
                          <div key={coupon.id} className="group relative">
                            <div className="bg-white rounded-2xl border border-coral/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                              {coupon.image_url && (
                                <div className="aspect-video relative overflow-hidden">
                                  <img 
                                    src={coupon.image_url} 
                                    alt={coupon.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </div>
                              )}
                              <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full">
                                    <span className="font-outfit text-xs font-bold">ACTIVE</span>
                                  </div>
                                  {coupon.valid_until && (
                                    <span className="font-outfit text-xs text-muted-foreground">
                                      Until {new Date(coupon.valid_until).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                
                                <h5 className="font-playfair text-xl font-bold text-foreground mb-2">{coupon.title}</h5>
                                
                                {coupon.business_name && (
                                  <p className="font-outfit text-accent font-semibold mb-3">{coupon.business_name}</p>
                                )}
                                
                                {coupon.discount_amount && (
                                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-coral to-accent text-white rounded-xl font-outfit font-bold text-lg mb-4">
                                    {coupon.discount_amount} OFF!
                                  </div>
                                )}
                                
                                {coupon.description && (
                                  <p className="font-outfit text-muted-foreground text-sm leading-relaxed mb-4">{coupon.description}</p>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  {coupon.neighborhood && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <MapPin className="w-4 h-4" />
                                      <span className="font-outfit text-sm">{coupon.neighborhood}</span>
                                    </div>
                                  )}
                                  <div className={`px-3 py-1 rounded-xl font-outfit text-xs font-semibold ${
                                    coupon.is_active 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {coupon.is_active ? 'Live' : 'Paused'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Floating Action Buttons */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
                              <Button
                                size="sm"
                                className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-xl border-0 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  generateCouponInstagramStory(coupon);
                                }}
                              >
                                <Instagram className="w-4 h-4 text-pink-500" />
                              </Button>
                              <Button
                                size="sm"
                                className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-xl border-0 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCoupon(coupon.id);
                                }}
                              >
                                <Pencil className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                size="sm"
                                className="w-10 h-10 rounded-full bg-white/95 hover:bg-red-50 shadow-xl border-0 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCoupon(coupon.id);
                                }}
                                disabled={deletingCoupon}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {myCoupons.length > 4 && (
                        <div className="text-center mt-6">
                          <Button
                            variant="ghost"
                            className="font-outfit font-semibold text-accent hover:text-accent/80"
                            onClick={() => navigate('/profile/' + user?.id + '#coupons')}
                          >
                            View all {myCoupons.length} offers →
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Events Section */}
          {isOwnProfile && userEvents && userEvents.length > 0 && (
            <section className="relative">
              <div className="relative bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-coral/20 to-transparent rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <h3 className="font-playfair text-3xl font-bold text-foreground mb-8 flex items-center gap-4">
                    <Zap className="w-8 h-8 text-accent" />
                    My Events & Meetups
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {userEvents.map((event) => (
                      <div key={event.id} className="group relative">
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-accent/10">
                          <div className="aspect-video relative overflow-hidden">
                            {(event as any).video_url ? (
                              <video 
                                src={(event as any).video_url}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                muted
                                autoPlay
                                loop
                                playsInline
                                preload="metadata"
                                poster={event.image_url || communityEvent}
                              />
                            ) : (
                              <img 
                                src={event.image_url || communityEvent} 
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            
                            {/* Event Type Badge */}
                            <div className="absolute top-4 left-4">
                              <div className={`px-4 py-2 rounded-xl font-outfit font-bold text-white shadow-lg ${
                                event.event_type === 'meetup' 
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                              }`}>
                                {event.event_type === 'meetup' ? '👥 Meetup' : '🎉 Event'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              {event.date && (
                                <div className="flex items-center gap-2 text-accent">
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-outfit text-sm font-medium">
                                    {getRelativeDay(event.date)}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <h4 className="font-playfair text-xl font-bold text-foreground mb-3 line-clamp-2">
                              {event.title}
                            </h4>
                            
                            <p className="font-outfit text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                              {event.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span className="font-outfit text-sm font-medium">
                                  {event.location || 'Location TBD'}
                                </span>
                              </div>
                              {event.price && (
                                <div className="px-3 py-1 bg-gradient-to-r from-accent to-coral text-white rounded-xl font-outfit font-bold">
                                  ₪{event.price}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Floating Action Buttons */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
                          <Button
                            size="sm"
                            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-xl border-0 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateInstagramStory(event);
                            }}
                          >
                            <Instagram className="w-4 h-4 text-pink-500" />
                          </Button>
                          <Button
                            size="sm"
                            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-xl border-0 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(event.id);
                            }}
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            className="w-10 h-10 rounded-full bg-white/95 hover:bg-red-50 shadow-xl border-0 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Empty State for Events */}
          {isOwnProfile && userEvents && userEvents.length === 0 && !eventsLoading && (
            <section className="relative">
              <div className="relative bg-white/60 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-r from-accent to-coral rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Calendar className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="font-playfair text-2xl font-bold text-foreground mb-4">
                    Ready to Create Something Amazing?
                  </h3>
                  
                  <p className="font-outfit text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                    Start organizing your first event or meetup and bring your community together!
                  </p>
                  
                  <Button 
                    onClick={() => navigate('/events/create')}
                    className="bg-gradient-to-r from-accent to-coral hover:from-accent/90 hover:to-coral/90 text-white font-outfit font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Create Your First Event
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Logout Button */}
          {isOwnProfile && (
            <div className="text-center pt-8">
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="px-8 py-3 bg-white/60 backdrop-blur-lg border-red-200 text-red-600 hover:bg-red-600 hover:text-white font-outfit font-semibold rounded-2xl shadow-lg transition-all duration-300"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </Button>
            </div>
          )}
        </div>
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
      
      <InstagramStoryPopup
        isOpen={showStoryPopup}
        onClose={() => setShowStoryPopup(false)}
        storyUrl={generatedStoryUrl}
        isGenerating={generatingStory}
        title={currentEventTitle}
      />
    </div>
  );
};

export default ProfilePage;
