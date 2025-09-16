import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import DesktopHeader from '@/components/DesktopHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
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
  
  // Fetch meetups
  const {
    events: meetupEvents = [],
    refetch: refetchMeetups
  } = useEvents('meetup', meetupFilter === 'friends');

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
    <div className="min-h-screen bg-background" dir="ltr">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header title="Meetups" />
      </div>
      
      {/* Desktop Header */}
      <DesktopHeader title="Meetups" />
      
      <main className="px-3 lg:px-6 py-3 lg:py-6 space-y-5 lg:space-y-10 pb-24 lg:pb-8 w-full max-w-md lg:max-w-none mx-auto lg:mx-0">
        {/* Meetups Section */}
        <section className="home-section">
          <div className="flex justify-between items-center mb-4">
            <h2 className="title-section">
              wanna meet up
            </h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/all-meetups')}
                className="text-xs px-2 py-1 rounded-full border-2 border-primary bg-transparent text-black hover:border-primary/80"
              >
                All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCreateEvent(true)} 
                className="text-xs px-2 py-1 rounded-full border-2 border-primary bg-transparent text-foreground hover:border-primary/80 gap-1"
              >
                <Plus className="h-3 w-3 text-black" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4">
            <Button 
              variant={meetupFilter === 'all' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setMeetupFilter('all')} 
              className="text-xs px-2 py-1 rounded-full h-6"
            >
              All
            </Button>
            <Button 
              variant={meetupFilter === 'friends' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setMeetupFilter('friends')} 
              className={`text-xs px-2 py-1 rounded-full h-6 ${meetupFilter === 'friends' ? '' : 'bg-white border-primary text-primary hover:bg-white/90'}`} 
              disabled={!user}
            >
              <Users className="h-2.5 w-2.5 mr-1" />
              Friends
            </Button>
          </div>
          
          {meetupEvents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No meetups available at the moment</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
              {meetupEvents.map((event, index) => (
                <ScrollAnimatedCard key={`meetup-${event.id}`} index={index}>
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