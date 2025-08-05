import BottomNavigation from "@/components/BottomNavigation";
import NotificationsPopup from "@/components/NotificationsPopup";
import EventPopup from "@/components/EventPopup";
import BusinessPopup from "@/components/BusinessPopup";
import MarketplacePopup from "@/components/MarketplacePopup";
import UniformCard from "@/components/UniformCard";
import FriendsFeedUpload from "@/components/FriendsFeedUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, ArrowLeft, Heart, Users, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useFriends } from "@/hooks/useFriends";
import { useFriendsFeedPosts } from "@/hooks/useFriendsFeedPosts";
import { useFriendsPictureGalleries } from "@/hooks/useFriendsPictureGalleries";
import { useAuth } from "@/contexts/AuthContext";
import FriendsPictureUpload from "@/components/FriendsPictureUpload";
import { useNeighborQuestions } from "@/hooks/useNeighborQuestions";
import { NeighborQuestionCard } from "@/components/NeighborQuestionCard";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/integrations/supabase/client";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends, getAllFriendsItemsByCategory, loading: friendsLoading } = useFriends();
  const { posts: friendsPosts, loading: postsLoading } = useFriendsFeedPosts();
  const { galleries: pictureGalleries, loading: galleriesLoading } = useFriendsPictureGalleries();
  const { questions, loading: questionsLoading } = useNeighborQuestions();
  const [questionProfiles, setQuestionProfiles] = useState<{[key: string]: any}>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventPopupOpen, setIsEventPopupOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [isBusinessPopupOpen, setIsBusinessPopupOpen] = useState(false);
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState<any>(null);
  const [isMarketplacePopupOpen, setIsMarketplacePopupOpen] = useState(false);
  const [friendsItemsByCategory, setFriendsItemsByCategory] = useState<{ [category: string]: any[] }>({});
  const [loading, setLoading] = useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);

  useEffect(() => {
    const loadFriendsItems = async () => {
      if (friends.length === 0) return;
      
      setLoading(true);
      try {
        const itemsByCategory = await getAllFriendsItemsByCategory();
        setFriendsItemsByCategory(itemsByCategory);
      } catch (error) {
        console.error('Error loading friends items by category:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFriendsItems();
  }, [friends, getAllFriendsItemsByCategory]);

  // Fetch user profiles for neighbor questions
  useEffect(() => {
    const fetchQuestionProfiles = async () => {
      if (questions.length === 0) return;

      const userIds = [...new Set(questions.map(q => q.user_id))];
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, profile_image_url')
          .in('id', userIds);

        if (error) {
          console.error('Error fetching question profiles:', error);
        } else {
          const profilesMap = (data || []).reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as {[key: string]: any});
          
          setQuestionProfiles(profilesMap);
        }
      } catch (err) {
        console.error('Unexpected error fetching question profiles:', err);
      }
    };

    fetchQuestionProfiles();
  }, [questions]);

  const handleItemClick = (item: any) => {
    navigate(`/item/${item.id}`);
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      'secondhand': 'יד שנייה',
      'event': 'אירועים',
      'business': 'עסקים',
      'art': 'אמנות',
      'recommendation': 'המלצות',
      'other': 'אחר'
    };
    return categoryNames[category] || category;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'עכשיו';
    if (diffInMinutes < 60) return `לפני ${diffInMinutes} דקות`;
    if (diffInMinutes < 1440) return `לפני ${Math.floor(diffInMinutes / 60)} שעות`;
    return `לפני ${Math.floor(diffInMinutes / 1440)} ימים`;
  };

  // Helper function to format time ago for questions (similar to FeedPage)
  function getTimeAgo(dateString: string) {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "עכשיו";
    if (diffInHours === 1) return "לפני שעה";
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "אתמול";
    return `לפני ${diffInDays} ימים`;
  }


  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">עליך להתחבר</h2>
          <p className="text-gray-500">כדי לראות תוכן של חברים</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            התחבר
          </Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Custom Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <Button variant="ghost" size="sm" onClick={() => setShowNotifications(true)}>
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
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
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <Camera className="h-4 w-4" onClick={() => setIsPhotoUploadOpen(true)} />
                פיד חברים
              </TabsTrigger>
              <TabsTrigger value="items" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                פריטים לפי קטגוריה
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              {/* Upload Section */}
              <FriendsFeedUpload />

              {/* שאלות שכנים Section */}
              <section className="bg-card/30 backdrop-blur-sm rounded-xl p-4 lg:p-4 border border-border/20 shadow-sm">
                <SectionHeader title="שאלות חברים" />
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  <NeighborQuestionCard />
                  {questionsLoading ? (
                    <div className="text-center py-4 flex-shrink-0">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : (
                    questions.map((question) => {
                      const userProfile = questionProfiles[question.user_id];
                      return (
                        <div 
                          key={`question-${question.id}`} 
                          className="flex-shrink-0 w-64 bg-white border border-border rounded-lg p-4"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <img 
                              src={userProfile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                              alt={userProfile?.name || "משתמש"}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground text-sm">
                                {userProfile?.name || "משתמש"}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {getTimeAgo(question.created_at)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed break-words">
                            {question.content}
                          </p>
                        </div>
                      );
                    })
                  )}
                  {questions.length === 0 && !questionsLoading && (
                    <div className="text-center py-8 text-muted-foreground flex-shrink-0">
                      <p>אין שאלות עדיין</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Friends Posts */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">פוסטים של חברים</h2>
                {postsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">טוען פוסטים...</p>
                  </div>
                ) : friendsPosts.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-muted-foreground">אין פוסטים עדיין</p>
                      <p className="text-sm text-muted-foreground">בואו נתחיל לשתף תוכן!</p>
                    </CardContent>
                  </Card>
                ) : (
                  friendsPosts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={post.profiles?.profile_image_url} />
                            <AvatarFallback>{post.profiles?.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{post.profiles?.name || 'משתמש'}</span>
                              <span className="text-sm text-muted-foreground">
                                {formatTimeAgo(post.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {post.content && (
                          <p className="mb-3 text-sm">{post.content}</p>
                        )}
                        
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt="Post image"
                            className="w-full max-h-96 object-cover rounded-lg"
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-center mb-2">פריטים של חברים</h1>
                <p className="text-center text-muted-foreground">
                  {friends.length} חברים • {Object.values(friendsItemsByCategory).reduce((total, items) => total + items.length, 0)} פריטים
                </p>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">טוען פריטים...</p>
                </div>
              ) : Object.keys(friendsItemsByCategory).length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-600 mb-2">אין פריטים עדיין</h2>
                  <p className="text-gray-500">החברים שלך עדיין לא פרסמו פריטים</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(friendsItemsByCategory).map(([category, items]) => (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{getCategoryDisplayName(category)}</span>
                          <Badge variant="secondary">{items.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {items.map((item) => (
                            <div key={`${item.id}-${item.user_id}`} className="space-y-2">
                              <UniformCard
                                id={item.id}
                                image={item.image_url}
                                title={item.title}
                                subtitle={item.description}
                                price={item.price}
                                type="marketplace"
                                onClick={() => handleItemClick(item)}
                                favoriteData={item}
                              />
                              {item.uploader && (
                                <div className="flex items-center gap-2 px-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={item.uploader.profile_image_url} />
                                    <AvatarFallback className="text-xs">{item.uploader.name?.[0] || 'U'}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground">{item.uploader.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
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

      {/* Photo Upload Dialog */}
      <Dialog open={isPhotoUploadOpen} onOpenChange={setIsPhotoUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>העלה גלריית תמונות</DialogTitle>
          </DialogHeader>
          <FriendsPictureUpload onGalleryCreated={() => setIsPhotoUploadOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <BottomNavigation />
    </div>
  );
};

export default FavoritesPage;