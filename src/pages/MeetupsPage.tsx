import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import DesktopHeader from '@/components/DesktopHeader';
import BottomNavigation from '@/components/BottomNavigation';
import MoodFilterStrip from '@/components/MoodFilterStrip';
import { Button } from '@/components/ui/button';
import { Users, Plus, Sparkles } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import FastLoadingSkeleton from '@/components/FastLoadingSkeleton';
import ScrollAnimatedCard from '@/components/ScrollAnimatedCard';
import UniformCard from '@/components/UniformCard';
import { getRelativeDay } from '@/utils/dateUtils';
import MeetupVerticalPopup from '@/components/MeetupVerticalPopup';
import CreateEventPopup from '@/components/CreateEventPopup';
import communityEvent from '@/assets/community-event.jpg';
import profile1 from '@/assets/profile-1.jpg';

const MeetupsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Meetup states
  const [meetupFilter, setMeetupFilter] = useState<'all' | 'friends'>('all');
  const [selectedMeetupItem, setSelectedMeetupItem] = useState<any>(null);
  const [isMeetupPopupOpen, setIsMeetupPopupOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>('all');
  
  // Fetch meetups
  const {
    events: meetupEvents = [],
    refetch: refetchMeetups
  } = useEvents('meetup', meetupFilter === 'friends');

  // Mood filter handler
  const handleMoodFilterChange = useCallback((mood: string) => {
    setSelectedMood(mood);
  }, []);

  // Meetup click handler for vertical scrolling popup
  const handleMeetupClick = useCallback((meetup: any, allMeetups?: any[], currentIndex?: number) => {
    const meetupDetails = {
      id: meetup.id,
      title: meetup.title,
      image: meetup.image_url || meetup.image,
      price: meetup.price || 'Free',
      description: meetup.description || meetup.title,
      neighborhood: meetup.neighborhood || meetup.location,
      seller: {
        id: meetup.uploader?.id,
        name: meetup.uploader?.name || meetup.organizer?.name || "Organizer",
        image: meetup.uploader?.image || meetup.organizer?.image || profile1,
        location: meetup.uploader?.location || meetup.location || "Tel Aviv"
      },
      type: 'meetup',
      allItems: allMeetups,
      currentIndex: currentIndex || 0
    };
    setSelectedMeetupItem(meetupDetails);
    setIsMeetupPopupOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5" dir="ltr">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header title="Meetups" />
      </div>
      
      {/* Desktop Header */}
      <DesktopHeader title="Meetups" />
      
      {/* Mood Filter Strip */}
      <MoodFilterStrip onFilterChange={handleMoodFilterChange} showTitle={false} />
      
      <main className="px-3 lg:px-6 py-6 lg:py-8 space-y-6 lg:space-y-8 pb-24 lg:pb-8 w-full max-w-md lg:max-w-none mx-auto lg:mx-0">
        {/* Hero Section */}
        <section className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Find Your Perfect Meetup</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            wanna meet up?
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connect with like-minded people in your area. Join exciting meetups or create your own!
          </p>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/all-meetups')}
            className="rounded-full border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/40 transition-all duration-200"
          >
            Browse All
          </Button>
          <Button 
            onClick={() => setShowCreateEvent(true)} 
            className="rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Meetup
          </Button>
        </div>

        {/* Meetups Section */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Featured Meetups for <span className="text-primary capitalize">{selectedMood}</span> Mood
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
          </div>
          
          
          {meetupEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No meetups found</h3>
              <p className="text-muted-foreground mb-6">Be the first to create a meetup for this mood!</p>
              <Button 
                onClick={() => setShowCreateEvent(true)}
                className="rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Meetup
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 pr-2">
              {meetupEvents.map((event, index) => (
                <ScrollAnimatedCard key={`meetup-${event.id}`} index={index}>
                  <div className="transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl">
                    <UniformCard 
                      id={event.id} 
                      image={event.image_url || communityEvent} 
                      video={(event as any).video_url} 
                      title={event.title} 
                      subtitle={event.location || 'Tel Aviv'} 
                      price={event.price} 
                      date={getRelativeDay(event.date)} 
                      type="event" 
                      uploader={event.uploader} 
                      onProfileClick={userId => navigate(`/profile/${userId}`)} 
                      onClick={() => handleMeetupClick({
                        id: event.id,
                        title: event.title,
                        description: event.description || event.title,
                        date: event.date || 'Date to be determined',
                        time: event.time || 'Time to be determined',
                        location: event.location || 'Tel Aviv',
                        price: event.price,
                        image: event.image_url || communityEvent,
                        video: (event as any).video_url,
                        uploader: event.uploader,
                        organizer: {
                          name: event.uploader?.name || "Meetup Organizer",
                          image: event.uploader?.image || profile1
                        }
                      }, [...meetupEvents], index)} 
                      showFavoriteButton={true} 
                      favoriteData={{
                        id: event.id,
                        title: event.title,
                        description: event.description || event.title,
                        image: event.image_url,
                        type: 'meetup'
                      }} 
                    />
                  </div>
                </ScrollAnimatedCard>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Meetup Popup */}
      {isMeetupPopupOpen && selectedMeetupItem && (
        <MeetupVerticalPopup 
          isOpen={isMeetupPopupOpen} 
          onClose={() => setIsMeetupPopupOpen(false)} 
          item={selectedMeetupItem} 
        />
      )}

      {/* Create Event Popup */}
      {showCreateEvent && (
        <CreateEventPopup 
          isOpen={showCreateEvent} 
          onClose={() => setShowCreateEvent(false)} 
          initialEventType="meetup" 
          onEventCreated={() => {
            refetchMeetups();
          }} 
        />
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default MeetupsPage;