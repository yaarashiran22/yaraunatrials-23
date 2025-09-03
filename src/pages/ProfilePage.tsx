import { Calendar, MapPin, Users, Trash2, Pencil, Edit, X, Star, Heart, MessageCircle, Share2, Bell, ChevronLeft, ChevronRight, Play, Pause, Instagram, Settings, Gift, Plus, LogOut } from "lucide-react";
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

  const handleLogout = () => {
    navigate('/login');
  };

  const handleEditEvent = (eventId: string) => {
    const eventToEdit = userEvents?.find(e => e.id === eventId);
    if (eventToEdit) {
      setSelectedEventForEdit(eventToEdit);
      setShowEditEvent(true);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId);
    }
  };

  const generateInstagramStory = async (eventData: any) => {
    setGeneratingStory(true);
    setCurrentEventTitle(eventData.title);
    setShowStoryPopup(true);
    
    try {
      console.log('Generating Instagram story for event:', eventData);
      
      const response = await supabase.functions.invoke('generate-instagram-story', {
        body: {
          eventData: {
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            location: eventData.location,
            description: eventData.description,
            image_url: eventData.image_url
          },
          userProfile: {
            name: profileData?.name || 'Unknown',
            profile_image_url: profileData?.profile_image_url
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { imageUrl } = response.data;
      setGeneratedStoryUrl(imageUrl);
      
    } catch (error) {
      console.error('Error generating Instagram story:', error);
      toast({
        title: "Error",
        description: "Failed to generate Instagram story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingStory(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 pb-20" dir="ltr">
        <Header 
          title="Profile"
          onNotificationsClick={() => setShowNotifications(true)}
        />
        <main className="px-4 py-6 pb-20">
          <div className="flex items-center justify-center h-64">
            <div className="card-elevated p-8 rounded-3xl bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-medium text-gray-700">Loading profile...</span>
              </div>
            </div>
          </div>
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 pb-20" dir="ltr">
          <Header 
            title="Profile"
            onNotificationsClick={() => setShowNotifications(true)}
          />
          <main className="px-4 py-6 pb-20">
            <div className="text-center mt-8">
              <div className="card-3d p-6 rounded-2xl border-red-200 bg-red-50">
                <p className="text-red-600 font-medium mb-4">
                  Please log in to view profile
                </p>
                <Button onClick={() => navigate('/login')}>
                  Login
                </Button>
              </div>
            </div>
          </main>
          <BottomNavigation />
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 pb-20" dir="ltr">
        <Header 
          title="Profile"
          onNotificationsClick={() => setShowNotifications(true)}
        />
        <main className="px-4 py-6 pb-20">
          <div className="text-center mt-8">
            <div className="card-3d p-6 rounded-2xl border-red-200 bg-red-50">
              <p className="text-red-600 font-medium mb-4">
                {error || 'Profile not found'}
              </p>
              {isOwnProfile && (
                <Button onClick={() => navigate('/profile/edit')}>
                  Create Profile
                </Button>
              )}
            </div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 pb-20" dir="ltr">
      <Header 
        title="Profile"
        onNotificationsClick={() => setShowNotifications(true)}
      />

      <main className="px-4 py-6 pb-20">
        {/* Enhanced Profile Header with colorful card */}
        <div className="card-elevated p-8 rounded-3xl bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 backdrop-blur-sm border border-white/20 mb-8">
          <div className="flex items-start gap-6">
            {/* Profile Image with glow effect */}
            <div 
              className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-500 p-1 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex-shrink-0"
              onClick={() => setShowProfilePicture(true)}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                <img
                  src={profileData.profile_image_url || '/placeholder.svg'}
                  alt={profileData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Profile Details with enhanced styling */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {profileData.name}
                </h1>
                {profileData.bio && (
                  <p className="text-gray-600 mt-2 leading-relaxed font-medium">{profileData.bio}</p>
                )}
              </div>
              
              {/* Enhanced Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                {!isOwnProfile && (
                  <>
                    <Button
                      onClick={() => addFriend(actualProfileId!)}
                      className={`${isFriend(actualProfileId!) ? 
                        "btn-3d bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" : 
                        "btn-3d bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                      } text-white border-0 px-4 py-2 font-medium`}
                      size="sm"
                    >
                      {isFriend(actualProfileId!) ? "Friends" : "Add Friend"}
                    </Button>
                    
                    <Button
                      onClick={() => toggleFollow(actualProfileId!)}
                      className={`${isFollowing(actualProfileId!) ? 
                        "btn-3d bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white" : 
                        "card-3d border-2 border-purple-200 hover:border-purple-300 text-purple-600 hover:text-purple-700"
                      } px-4 py-2 font-medium`}
                      size="sm"
                      disabled={isToggling}
                    >
                      {isFollowing(actualProfileId!) ? "Following" : "Follow"}
                    </Button>
                  </>
                )}
                
                {isOwnProfile && (
                  <>
                    <Button 
                      onClick={() => navigate('/edit-profile')} 
                      className="btn-3d bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 px-4 py-2 font-medium"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button 
                      onClick={() => navigate('/settings')} 
                      className="card-3d border-2 border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-700 px-4 py-2 font-medium"
                      size="sm"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Events Section with colorful styling */}
        {userEvents && userEvents.length > 0 && (
          <div className="card-elevated p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-white/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {isOwnProfile ? "My Events" : `${profileData.name}'s Events`}
              </h3>
              {isOwnProfile && (
                <Button 
                  onClick={() => navigate('/create-event')}
                  className="btn-3d bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-4 py-2 font-medium"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {userEvents.slice(0, 3).map((event, index) => (
                <div key={event.id} className="card-3d rounded-2xl p-4 transform hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-start gap-4">
                    {event.image_url && (
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">{event.title}</h4>
                      {event.date && (
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(event.date), 'MMM d, yyyy')}</span>
                          {event.time && <span>at {event.time}</span>}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    {isOwnProfile && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => generateInstagramStory(event)}
                        >
                          <Instagram className="w-4 h-4 text-pink-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handleEditEvent(event.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {userEvents.length > 3 && (
                <div className="text-center pt-4">
                  <Button 
                    onClick={() => navigate(isOwnProfile ? '/events' : `/profile/${actualProfileId}/events`)}
                    className="btn-3d bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-0 px-6 py-3 font-medium"
                    size="sm"
                  >
                    View All Events ({userEvents.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Posts Section with vibrant styling */}
        {imagePosts && imagePosts.length > 0 && (
          <div className="card-elevated p-6 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 border border-white/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {isOwnProfile ? "My Posts" : `${profileData.name}'s Posts`}
              </h3>
              {isOwnProfile && (
                <Button 
                  onClick={() => navigate('/feed')}
                  className="btn-3d bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-4 py-2 font-medium"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              )}
            </div>
            <div>
              <div className="grid grid-cols-3 gap-3">
                {imagePosts.slice(0, 9).map((post, index) => (
                  <div 
                    key={post.id}
                    className={`aspect-square rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl
                      ${index % 3 === 0 ? 'bg-gradient-to-br from-pink-100 to-purple-100' :
                        index % 3 === 1 ? 'bg-gradient-to-br from-blue-100 to-indigo-100' :
                        'bg-gradient-to-br from-green-100 to-emerald-100'
                      } p-0.5`}
                    onClick={() => {
                      setSelectedImageId(post.id);
                      setShowFeedImages(true);
                    }}
                  >
                    <div className="w-full h-full rounded-2xl overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={'Post image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {imagePosts.length > 9 && (
                <div className="text-center mt-6">
                  <Button 
                    onClick={() => navigate(isOwnProfile ? '/feed' : `/profile/${actualProfileId}/posts`)}
                    className="btn-3d bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 px-6 py-3 font-medium"
                    size="sm"
                  >
                    View All Posts ({imagePosts.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
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