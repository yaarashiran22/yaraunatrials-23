import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import NotificationsPopup from "@/components/NotificationsPopup";
import StoriesPopup from "@/components/StoriesPopup";
import MarketplacePopup from "@/components/MarketplacePopup";
import UniformCard from "@/components/UniformCard";
import SectionHeader from "@/components/SectionHeader";
import { PostCommentsModal } from "@/components/PostCommentsModal";
import { PostItem } from "@/components/PostItem";
import FeedUpload from "@/components/FeedUpload";

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
import { NeighborQuestionItem } from "@/components/NeighborQuestionItem";
import { usePostLikes } from "@/hooks/usePostLikes";
import { usePostComments } from "@/hooks/usePostComments";
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
  const { posts, loading, fetchPosts, deletePost } = usePosts();
  const { questions, loading: questionsLoading, deleteQuestion } = useNeighborQuestions();
  const [questionProfiles, setQuestionProfiles] = useState<{[key: string]: any}>({});
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);

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

      const userIds = [...new Set(questions.map(q => q.user_id).filter(id => id !== null))];
      
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
      userId: post.user_id,
      userImage: userProfile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png",
      userName: userProfile?.name || "משתמש",
      tag: post.location || "תושב שכונה",
      timeAgo: getTimeAgo(post.created_at),
      content: post.content,
      image: post.image_url
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

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    const success = await deletePost(postId);
    if (success) {
      // Post will be removed from the list automatically by the deletePost function
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header 
        title="פיד שכונתי" 
        onNotificationsClick={() => setShowNotifications(true)}
      />

      <main className="px-4 py-4 pb-32">
        {/* הכר את השכנים Button - Made more subtle */}
        <div className="mb-4 mt-2">
          <Button 
            onClick={() => navigate('/neighbors')}
            variant="outline"
            className="w-full text-foreground/80 border-primary/20 hover:bg-primary/5 hover:border-primary/30 font-medium py-3 text-sm shadow-sm"
          >
            הכר את השכונה
          </Button>
        </div>

        {/* Upload Card - Only show if user is authenticated */}
        {user && (
          <FeedUpload onPostCreated={fetchPosts} />
        )}

        {/* שאלות שכנים Section - Moved below post sharing */}
        <section className="bg-card/30 backdrop-blur-sm rounded-xl p-1.5 lg:p-2 border border-border/20 shadow-sm mb-6">
          <div className="mb-3 px-2">
            <SectionHeader title="שאלות שכנים" />
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-hide">
            <NeighborQuestionCard />
            {questionsLoading ? (
              <div className="text-center py-4 flex-shrink-0">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              questions.map((question) => {
                const userProfile = question.user_id ? questionProfiles[question.user_id] : null;
                return (
                  <NeighborQuestionItem
                    key={`question-${question.id}`}
                    question={question}
                    userProfile={userProfile}
                    getTimeAgo={getTimeAgo}
                    questionProfiles={questionProfiles}
                    onDeleteQuestion={deleteQuestion}
                  />
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
              <PostItem
                key={post.id}
                post={post}
                onCommentsClick={setSelectedPostForComments}
                onDelete={handleDeletePost}
              />
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
      
      {selectedPostForComments && (
        <PostCommentsModal
          isOpen={!!selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
          postId={selectedPostForComments}
        />
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default FeedPage;