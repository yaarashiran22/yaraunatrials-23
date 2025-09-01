import React, { useEffect, useState } from 'react';
import { MapPin, Users, Calendar, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import LocationShareButton from '@/components/LocationShareButton';
import AddRecommendationCard from "@/components/AddRecommendationCard";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const DiscoverPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [userRecommendations, setUserRecommendations] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'friends' | 'following' | 'meet' | 'event'>('meet');

  // Function to fetch items based on filter
  const fetchItems = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      let items: any[] = [];
      
      if (filterType === 'event') {
        // Fetch events from events table
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*');
        
        if (eventsError) throw eventsError;
        
        items = eventsData?.map(event => ({
          ...event,
          category: 'event',
          description: event.description || event.title
        })) || [];
      } else if (filterType === 'meet') {
        // Fetch meetup items from items table
        const { data: meetData, error: meetError } = await supabase
          .from('items')
          .select('*')
          .in('category', ['meetup', 'social', 'community'])
          .eq('status', 'active');

        if (meetError) throw meetError;
        items = meetData || [];
      } else {
        // Fetch text pins and other items
        let query = supabase
          .from('items')
          .select('*')
          .eq('category', 'text_pin')
          .eq('status', 'active');

        if (filterType === 'friends') {
          // Get user's friends
          const { data: friendsData, error: friendsError } = await supabase
            .from('user_friends')
            .select('friend_id')
            .eq('user_id', user.id);

          if (friendsError) throw friendsError;

          const friendIds = friendsData?.map(f => f.friend_id) || [];
          if (friendIds.length > 0) {
            const { data, error } = await query.in('user_id', friendIds);
            if (error) throw error;
            items = data || [];
          }
        } else {
          const { data, error } = await query;
          if (error) throw error;
          items = data || [];
        }
      }

      // Fetch user profiles for items
      const userIds = items?.map(item => item.user_id).filter(Boolean) || [];
      let profiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, profile_image_url')
          .in('id', userIds);
        profiles = profilesData || [];
      }

      // Combine items with profiles
      const itemsWithProfiles = items?.map(item => ({
        ...item,
        profile: profiles.find(p => p.id === item.user_id)
      })) || [];

      setUserRecommendations(itemsWithProfiles);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Error loading content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filterType, user?.id]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Discover"
      />
      
      <main className="container mx-auto px-4 py-3 space-y-6">
        {/* Filter Buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            variant={filterType === 'friends' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('friends')}
            className={`text-xs px-3 py-1 rounded-full ${
              filterType === 'friends' 
                ? 'bg-accent-subtle text-white border-accent-subtle hover:bg-accent-subtle/90' 
                : 'border-accent-subtle text-accent-subtle hover:bg-accent-muted'
            }`}
            style={filterType === 'friends' ? {
              backgroundColor: 'hsl(var(--accent-subtle))',
              borderColor: 'hsl(var(--accent-subtle))',
              color: 'white'
            } : {
              borderColor: 'hsl(var(--accent-subtle))',
              color: 'hsl(var(--accent-subtle))'
            }}
            disabled={!user}
          >
            <Users className="h-3 w-3 mr-1" />
            Friends
          </Button>
          <Button
            variant={filterType === 'meet' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('meet')}
            className={`text-xs px-3 py-1 rounded-full ${
              filterType === 'meet' 
                ? 'bg-accent-subtle text-white border-accent-subtle hover:bg-accent-subtle/90' 
                : 'border-accent-subtle text-accent-subtle hover:bg-accent-muted'
            }`}
            style={filterType === 'meet' ? {
              backgroundColor: 'hsl(var(--accent-subtle))',
              borderColor: 'hsl(var(--accent-subtle))',
              color: 'white'
            } : {
              borderColor: 'hsl(var(--accent-subtle))',
              color: 'hsl(var(--accent-subtle))'
            }}
          >
            <Coffee className="h-3 w-3 mr-1" />
            Meet
          </Button>
          <Button
            variant={filterType === 'event' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('event')}
            className={`text-xs px-3 py-1 rounded-full ${
              filterType === 'event' 
                ? 'bg-accent-subtle text-white border-accent-subtle hover:bg-accent-subtle/90' 
                : 'border-accent-subtle text-accent-subtle hover:bg-accent-muted'
            }`}
            style={filterType === 'event' ? {
              backgroundColor: 'hsl(var(--accent-subtle))',
              borderColor: 'hsl(var(--accent-subtle))',
              color: 'white'
            } : {
              borderColor: 'hsl(var(--accent-subtle))',
              color: 'hsl(var(--accent-subtle))'
            }}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Event
          </Button>
        </div>
        
        {/* Content Section */}
        <div className="relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-muted-foreground text-sm">Loading content...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center p-4">
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {userRecommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No items found for the selected filter</p>
                </div>
              ) : (
                userRecommendations.map((item) => (
                  <div key={item.id} className="bg-card rounded-xl p-4 border border-border/20 shadow-sm">
                    <div className="flex items-start gap-3">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description || item.title}
                        </p>
                        {item.profile && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <img 
                              src={item.profile.profile_image_url || '/placeholder.svg'} 
                              alt=""
                              className="w-4 h-4 rounded-full"
                            />
                            <span>by {item.profile.name || 'User'}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {item.category === 'event' && <Calendar className="h-3 w-3" />}
                        {(item.category === 'meetup' || item.category === 'social' || item.category === 'community') && <Coffee className="h-3 w-3" />}
                        {item.category === 'text_pin' && <MapPin className="h-3 w-3" />}
                        <span className="capitalize">{item.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <AddRecommendationCard onRecommendationAdded={fetchItems} className="w-20" />
            <LocationShareButton size="sm" shareText="Share Location" removeText="Remove Location" className="w-32 text-xs" />
          </div>
        </div>

      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default DiscoverPage;