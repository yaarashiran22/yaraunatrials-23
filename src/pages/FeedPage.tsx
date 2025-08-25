import Header from "@/components/Header";
import DesktopHeader from "@/components/DesktopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import NotificationsPopup from "@/components/NotificationsPopup";
import StoriesPopup from "@/components/StoriesPopup";
import MarketplacePopup from "@/components/MarketplacePopup";
import UniformCard from "@/components/UniformCard";
import SectionHeader from "@/components/SectionHeader";
import BuenosAiresMap from "@/components/BuenosAiresMap";
import LocationShareButton from "@/components/LocationShareButton";

import { Button } from "@/components/ui/button";
import { Search, X, Heart, MessageCircle, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStories } from "@/hooks/useStories";
import { useOptimizedHomepage } from "@/hooks/useOptimizedHomepage";
import NeighborCard from "@/components/NeighborCard";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useNeighborQuestions } from "@/hooks/useNeighborQuestions";
import { NeighborQuestionCard } from "@/components/NeighborQuestionCard";
import { NeighborQuestionItem } from "@/components/NeighborQuestionItem";
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
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState<any>(null);
  const [isMarketplacePopupOpen, setIsMarketplacePopupOpen] = useState(false);
  const { questions, loading: questionsLoading, deleteQuestion } = useNeighborQuestions();
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

  // Helper function to format time ago
  function getTimeAgo(dateString: string) {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "yesterday";
    return `${diffInDays} days ago`;
  }

  // Function to handle marketplace item click
  const handleMarketplaceClick = (item: any, itemType?: string) => {
    const itemDetails = {
      id: item.id,
      title: item.title,
      image: item.image_url || item.image,
      price: item.price ? `₪${item.price}` : undefined,
      description: item.description || `${item.title} in excellent condition.`,
      seller: {
        name: "Yael Shein",
        image: profile1,
        location: item.location || "Tel Aviv"
      },
      condition: "Like New",
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
    <div className="min-h-screen bg-background" dir="ltr">
      <div className="lg:hidden">
        <Header 
          title="Neighborhood Feed"
          onNotificationsClick={() => setShowNotifications(true)}
        />
      </div>
      
      <DesktopHeader 
        title="Neighborhood Feed"
        onNotificationsClick={() => setShowNotifications(true)}
      />

      {/* Full Screen Map with Messages Overlay */}
      <main className="relative h-[calc(100vh-64px-80px)]"> {/* Account for header and bottom nav */}
        {/* Full Screen Buenos Aires Map */}
        <div className="absolute inset-0">
          <BuenosAiresMap className="w-full h-full" />
        </div>

        {/* Messages Section Overlay at Top */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <section className="bg-card/95 backdrop-blur-sm rounded-xl p-1.5 lg:p-2 border border-border/20 shadow-lg">
            <div className="mb-3 px-2 flex items-center justify-between">
              <SectionHeader title="Messages" />
              <LocationShareButton size="sm" />
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
                  <p>No questions yet</p>
                </div>
              )}
            </div>
          </section>
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