import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import UniformCard from '@/components/UniformCard';
import ScrollAnimatedCard from '@/components/ScrollAnimatedCard';
import FastLoadingSkeleton from '@/components/FastLoadingSkeleton';
import { useEvents } from '@/hooks/useEvents';
import { getRelativeDay } from '@/utils/dateUtils';
import communityEvent from "@/assets/community-event.jpg";
import profile1 from "@/assets/profile-1.jpg";

const AllMeetupsPage = () => {
  const navigate = useNavigate();
  const { events: meetupEvents = [], loading } = useEvents('meetup');

  const handleEventClick = useCallback((event: any) => {
    // Navigate to event details or open popup
    navigate(`/events/${event.id}`);
  }, [navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Custom header with back button */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">All Meetups</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-muted-foreground">
            {meetupEvents.length} {meetupEvents.length === 1 ? 'meetup' : 'meetups'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FastLoadingSkeleton type="cards" count={6} />
          </div>
        ) : meetupEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No meetups available</h3>
            <p className="text-muted-foreground mb-6">Be the first to create a meetup in your area!</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetupEvents.map((event, index) => (
              <ScrollAnimatedCard key={`meetup-${event.id}`} index={index % 6}>
                <UniformCard
                  id={event.id}
                  image={event.image_url || communityEvent}
                  video={(event as any).video_url}
                  title={event.title}
                  subtitle={event.location || 'Location TBD'}
                  price={event.price}
                  date={getRelativeDay(event.date)}
                  type="event"
                  uploader={event.uploader}
                  onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                  onClick={() => handleEventClick({
                    id: event.id,
                    title: event.title,
                    description: event.description || event.title,
                    date: event.date || 'Date to be determined',
                    time: event.time || 'Time to be determined', 
                    location: event.location || 'Location TBD',
                    price: event.price,
                    image: event.image_url || communityEvent,
                    video: (event as any).video_url,
                    organizer: {
                      name: event.uploader?.name || "Meetup Organizer",
                      image: event.uploader?.image || profile1
                    }
                  })}
                  showFavoriteButton={true}
                  favoriteData={{
                    id: event.id,
                    title: event.title,
                    description: event.description || event.title,
                    image: event.image_url,
                    type: 'meetup'
                  }}
                />
              </ScrollAnimatedCard>
            ))}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default AllMeetupsPage;