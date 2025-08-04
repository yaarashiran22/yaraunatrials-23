import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import NotificationsPopup from "@/components/NotificationsPopup";
import StoriesPopup from "@/components/StoriesPopup";
import MarketplacePopup from "@/components/MarketplacePopup";
import UniformCard from "@/components/UniformCard";
import SectionHeader from "@/components/SectionHeader";

import { Button } from "@/components/ui/button";
import { Search, X, Heart, MessageCircle, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useStories } from "@/hooks/useStories";
import { useOptimizedHomepage } from "@/hooks/useOptimizedHomepage";
import NeighborCard from "@/components/NeighborCard";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useNeighborQuestions } from "@/hooks/useNeighborQuestions";
import { NeighborQuestionCard } from "@/components/NeighborQuestionCard";
import { supabase } from "@/integrations/supabase/client";

import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";
import communityEvent from "@/assets/community-event.jpg";
import coffeeShop from "@/assets/coffee-shop.jpg";
import vintageStore from "@/assets/vintage-store.jpg";

const FeedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const [showNeighborhood, setShowNeighborhood] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showStories, setShowStories] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [postProfiles, setPostProfiles] = useState<{[key: string]: any}>({});
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState<any>(null);
  const [isMarketplacePopupOpen, setIsMarketplacePopupOpen] = useState(false);
  const { posts, loading } = usePosts();
  const { questions, loading: questionsLoading } = useNeighborQuestions();
  const [questionProfiles, setQuestionProfiles] = useState<{[key: string]: any}>({});

  // Fetch registered users
  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, profile_image_url')
          .not('name', 'is', null);

        if (error) {
          console.error('Error fetching users:', error);
        } else {
          setRegisteredUsers(data || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching users:', err);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchRegisteredUsers();
  }, []);

  // Fetch user profiles for posts
  useEffect(() => {
    const fetchPostProfiles = async () => {
      if (posts.length === 0) return;

      const userIds = [...new Set(posts.map(post => post.user_id))];
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, profile_image_url')
          .in('id', userIds);

        if (error) {
          console.error('Error fetching post profiles:', error);
        } else {
          const profilesMap = (data || []).reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as {[key: string]: any});
          
          setPostProfiles(profilesMap);
        }
      } catch (err) {
        console.error('Unexpected error fetching post profiles:', err);
      }
    };

    fetchPostProfiles();
  }, [posts]);

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

  // Transform database posts to display format with real user data
  const displayPosts = posts.map(post => {
    const userProfile = postProfiles[post.user_id];
    
    return {
      id: post.id,
      userImage: userProfile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png",
      userName: userProfile?.name || "משתמש",
      tag: post.location || "תושב שכונה",
      timeAgo: getTimeAgo(post.created_at),
      content: post.content,
      image: post.image_url,
      likes: Math.floor(Math.random() * 15) + 1, // Random likes for demo
      comments: Math.floor(Math.random() * 8) + 1, // Random comments for demo
      isLiked: Math.random() > 0.5
    };
  });

  // Helper function to format time ago
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

  // Function to handle marketplace item click
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
      type: itemType || 'marketplace'
    };
    setSelectedMarketplaceItem(itemDetails);
    setIsMarketplacePopupOpen(true);
  };

  // Function to handle story viewing
  const handleStoryClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowStories(true);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header 
        title="פיד שכונתי" 
        onNotificationsClick={() => setShowNotifications(true)}
      />

      <main className="px-4 py-4 pb-32">


        {/* Upload Card - Only show if user is authenticated */}
        {user && (
          <div 
            className="bg-white rounded-lg p-4 mb-6 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm border"
            onClick={() => navigate('/create-post')}
          >
            <img 
              src={profile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <input 
                type="text"
                placeholder="שתפ.י פוסט"
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground border-none outline-none cursor-pointer"
                readOnly
              />
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            </div>
          </div>
        )}

        {/* שאלות שכנים Section */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-4 lg:p-4 border border-border/20 shadow-sm mb-6">
          <SectionHeader title="שאלות שכנים" />
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

        {/* Posts Feed */}
        <div className="space-y-6 mb-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">טוען פוסטים...</p>
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">אין פוסטים עדיין</p>
              <p className="text-sm text-muted-foreground mt-2">היה הראשון לפרסם בשכונה!</p>
            </div>
          ) : (
            displayPosts.map((post) => (
              <div key={post.id} className="bg-card rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <img 
                  src={post.userImage}
                  alt={post.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{post.userName}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {post.tag}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{post.timeAgo}</p>
                </div>
              </div>
                
                <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>
                
                {/* Display image if available */}
                {post.image && (
                  <div className="mb-4">
                    <img 
                      src={post.image} 
                      alt="Post image" 
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                  </div>
                )}
              
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0">
                  <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                  <span className="text-sm text-muted-foreground">{post.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{post.comments}</span>
                </Button>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
      
      <NotificationsPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      {selectedUserId && (
        <StoriesPopup 
          isOpen={showStories}
          onClose={() => {
            setShowStories(false);
            setSelectedUserId(null);
          }}
          userId={selectedUserId}
        />
      )}
      
      <MarketplacePopup 
        isOpen={isMarketplacePopupOpen}
        onClose={() => setIsMarketplacePopupOpen(false)}
        item={selectedMarketplaceItem}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default FeedPage;