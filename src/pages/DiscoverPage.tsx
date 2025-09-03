import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Users, Calendar, Coffee, Search, Heart, HeartOff, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from "@/components/Header";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import BottomNavigation from "@/components/BottomNavigation";
import OpenToHangButton from '@/components/LocationShareButton';
import AddRecommendationCard from "@/components/AddRecommendationCard";
import MoodFilterStrip from '@/components/MoodFilterStrip';
import DiscoveryPopup from '@/components/DiscoveryPopup';
import PeopleYouShouldMeetPopup from '@/components/PeopleYouShouldMeetPopup';
import { useUserLocations } from '@/hooks/useUserLocations';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { useSuggestedUsers } from '@/hooks/useSuggestedUsers';
import { useOpenToHang } from '@/hooks/useOpenToHang';
import { supabase } from '@/integrations/supabase/client';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DiscoverPage = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkersRef = useRef<L.Marker[]>([]);
  const recommendationMarkersRef = useRef<L.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [showPeopleYouShouldMeet, setShowPeopleYouShouldMeet] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const { userLocations } = useUserLocations();
  const { user } = useAuth();
  const { events: allEvents } = useEvents();
  const { events: allMeetups } = useEvents('meetup');
  const { suggestedUsers, loading: suggestedUsersLoading, findSuggestedUsers } = useSuggestedUsers();
  const { shareHangLocation, stopHanging, checkHangStatus, isLoading: hangLoading, isOpenToHang, setIsOpenToHang } = useOpenToHang();
  const [userRecommendations, setUserRecommendations] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'friends' | 'following' | 'meet' | 'event'>('meet');
  const [mapFilter, setMapFilter] = useState<'all' | 'events' | 'meetups'>('all');

  // Check user's hang status on load
  useEffect(() => {
    if (user) {
      checkHangStatus();
    }
  }, [user, checkHangStatus]);

  // Function to filter users by mood
  const handleMoodFilterChange = (mood: string) => {
    setSelectedMood(mood);
    
    if (!isOpenToHang) return; // Only filter when open to hang
    
    // Filter users based on mood and open to hang status
    let moodFilteredUsers = userLocations.filter(userLocation => {
      const profile = userLocation.profile as any;
      if (profile.id === user?.id) return false; // Skip current user
      if (userLocation.status !== 'open_to_hang') return false; // Only show users open to hang
      
      // If "all" mood selected, show all open to hang users
      if (mood === 'all') return true;
      
      // Filter by selected mood
      return userLocation.mood === mood;
    });
    
    setFilteredUsers(moodFilteredUsers);
    addUserLocationMarkers(moodFilteredUsers);
  };
  const handleDiscovery = async (selectedInterests: string[], connectionType: string) => {
    console.log('Discovery filters:', { selectedInterests, connectionType });
    
    if (!user) {
      console.log('No user logged in');
      return;
    }

    try {
      // Step 1: Get current user's event RSVPs with event details
      const { data: userRSVPs, error: rsvpError } = await supabase
        .from('event_rsvps')
        .select(`
          event_id,
          events!inner(
            id,
            title
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'going');

      if (rsvpError) {
        console.error('Error fetching user RSVPs:', rsvpError);
      }

      const userEventIds = userRSVPs?.map(rsvp => rsvp.event_id) || [];
      const userEvents = userRSVPs?.reduce((acc, rsvp) => {
        if (rsvp.events) {
          acc[rsvp.event_id] = (rsvp.events as any).title;
        }
        return acc;
      }, {} as Record<string, string>) || {};
      
      console.log('User RSVPs for events:', userEventIds);

      // Step 2: Find other users who RSVP'd for the same events with event details
      let usersWithSharedEvents: Record<string, string[]> = {};
      if (userEventIds.length > 0) {
        const { data: otherRSVPs, error: matchError } = await supabase
          .from('event_rsvps')
          .select(`
            user_id,
            event_id,
            events!inner(
              id,
              title
            )
          `)
          .in('event_id', userEventIds)
          .eq('status', 'going')
          .neq('user_id', user.id);

        if (matchError) {
          console.error('Error fetching matching RSVPs:', matchError);
        } else {
          // Group shared events by user
          otherRSVPs?.forEach(rsvp => {
            if (!usersWithSharedEvents[rsvp.user_id]) {
              usersWithSharedEvents[rsvp.user_id] = [];
            }
            if ((rsvp.events as any)?.title) {
              usersWithSharedEvents[rsvp.user_id].push((rsvp.events as any).title);
            }
          });
          console.log('Users with shared events:', usersWithSharedEvents);
        }
      }

      // Step 3: Filter users based on discovery criteria (2+ shared interests)
      const filtered = userLocations.filter(userLocation => {
        const profile = userLocation.profile as any;
        
        // Skip current user
        if (profile.id === user.id) return false;
        
        // Check interests match (at least 2 similar interests)
        const userInterests = profile.interests || [];
        const userSpecialties = profile.specialties || [];
        const allUserInterests = [...userInterests, ...userSpecialties];
        
        const sharedInterests = selectedInterests.filter(interest => 
          allUserInterests.some((userInterest: string) => 
            userInterest.toLowerCase().includes(interest.toLowerCase()) ||
            interest.toLowerCase().includes(userInterest.toLowerCase())
          )
        );
        
        const hasEnoughSharedInterests = sharedInterests.length >= 2;
        
        console.log(`User ${profile.name}:`, {
          hasSharedEvents: !!usersWithSharedEvents[profile.id],
          sharedInterests: sharedInterests.length,
          connectionType,
          userInterests: allUserInterests
        });
        
        // Show users with 2+ shared interests
        return hasEnoughSharedInterests;
      });
      
      // Separate users with shared events for highlighting
      const usersWithEvents = filtered.filter(userLocation => {
        const profile = userLocation.profile as any;
        return usersWithSharedEvents[profile.id];
      });
      
      // Add shared event info to user data
      const filteredWithEventInfo = filtered.map(userLocation => ({
        ...userLocation,
        sharedEvents: usersWithSharedEvents[userLocation.profile?.id] || []
      }));
      
      setFilteredUsers(filteredWithEventInfo);
      console.log('Filtered users:', filtered.length, 'Connection type:', connectionType);
      console.log('Users with shared events:', usersWithEvents.length);
      
      // Update markers to show filtered users, with special highlighting for those with shared events
      addUserLocationMarkers(filteredWithEventInfo, usersWithEvents);
      
    } catch (error) {
      console.error('Error in handleDiscovery:', error);
      // Fallback to basic filtering
      const basicFiltered = userLocations.filter(userLocation => {
        const profile = userLocation.profile as any;
        if (profile.id === user.id) return false;
        
        if (selectedInterests.length === 0) return true;
        
        const userInterests = profile.interests || [];
        const userSpecialties = profile.specialties || [];
        const allUserInterests = [...userInterests, ...userSpecialties];
        
        return selectedInterests.some(interest => 
          allUserInterests.some((userInterest: string) => 
            userInterest.toLowerCase().includes(interest.toLowerCase())
          )
        );
      });
      
      setFilteredUsers(basicFiltered);
      addUserLocationMarkers(basicFiltered);
    }
  };

  // Function to get neighborhood coordinates
  const getNeighborhoodCoordinates = (locationName: string) => {
    const neighborhoods: Record<string, { lat: number, lng: number }> = {
      "Palermo": { lat: -34.5870, lng: -58.4263 },
      "Palermo Soho": { lat: -34.5906, lng: -58.4203 },
      "Palermo Hollywood": { lat: -34.5834, lng: -58.4323 },
      "San Telmo": { lat: -34.6202, lng: -58.3731 },
      "Recoleta": { lat: -34.5885, lng: -58.3967 },
      "Villa Crespo": { lat: -34.5998, lng: -58.4386 },
      "Buenos Aires": { lat: -34.6118, lng: -58.3960 },
      "Tel Aviv": { lat: -34.6118, lng: -58.3960 }, // Default to Buenos Aires center
    };

    // Find matching neighborhood or default to Buenos Aires center
    const matchedNeighborhood = Object.keys(neighborhoods).find(name => 
      locationName.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(locationName.toLowerCase())
    );

    return neighborhoods[matchedNeighborhood || "Buenos Aires"];
  };

  // Function to handle neighborhood change
  const handleNeighborhoodChange = (neighborhoodName: string) => {
    if (!mapInstanceRef.current) return;

    const coordinates = getNeighborhoodCoordinates(neighborhoodName);
    if (coordinates) {
      mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 15, {
        animate: true,
        duration: 1.5
      });
    }
  };

  // Setup global handler for future functionality if needed
  useEffect(() => {
    // Text pins don't require special click handlers
    // This is kept for future functionality
    return () => {
      // Cleanup if needed
    };
  }, [user]);

  // Function to add user location markers
  const addUserLocationMarkers = (usersToShow = userLocations, highlightedUsers: any[] = []) => {
    if (!mapInstanceRef.current) return;

    // Filter users based on isOpenToHang state and mood
    let displayUsers = isOpenToHang 
      ? usersToShow.filter(user => user.status === 'open_to_hang')
      : usersToShow;
    
    // Apply mood filter if a specific mood is selected and user is open to hang
    if (isOpenToHang && selectedMood !== 'all') {
      displayUsers = displayUsers.filter(user => user.mood === selectedMood);
    }

    console.log('Adding user location markers, count:', displayUsers.length, 'isOpenToHang:', isOpenToHang);

    // Clear existing user markers
    if (userMarkersRef.current.length > 0) {
      userMarkersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      userMarkersRef.current = [];
    }

    // Add markers for each user location
    displayUsers.forEach((userLocation) => {
      if (!mapInstanceRef.current) return;

      console.log('Adding marker for user:', userLocation.profile?.name, 'at:', userLocation.latitude, userLocation.longitude);

      const profile = userLocation.profile as any;
      const hasSharedEvents = (userLocation as any).sharedEvents && (userLocation as any).sharedEvents.length > 0;
      const isOpenToHangStatus = (userLocation as any).status === 'open_to_hang';
      const userMood = userLocation.mood;

      // Create custom user icon with mood-based colors
      const getMoodColor = (mood?: string) => {
        switch (mood) {
          case 'chill': return 'border-blue-500';
          case 'go-out': return 'border-orange-500';
          case 'romantic': return 'border-pink-500';
          case 'active': return 'border-green-500';
          case 'creative': return 'border-purple-500';
          case 'wellness': return 'border-green-600';
          case 'sightseeing': return 'border-cyan-500';
          default: return 'border-white';
        }
      };

      const getMoodEmoji = (mood?: string) => {
        switch (mood) {
          case 'chill': return '☕';
          case 'go-out': return '⚡';
          case 'romantic': return '💕';
          case 'active': return '💪';
          case 'creative': return '🎨';
          case 'wellness': return '🧘';
          case 'sightseeing': return '📸';
          default: return '😊';
        }
      };

      const borderColor = hasSharedEvents ? 'border-red-500' : getMoodColor(userMood);
      const statusColor = hasSharedEvents ? 'bg-red-500' : isOpenToHangStatus ? 'bg-pink-500' : 'bg-green-500';
      const pulseClass = (hasSharedEvents || isOpenToHangStatus) ? 'animate-pulse' : '';
      
      const userIcon = L.divIcon({
        html: `
          <div class="w-8 h-8 rounded-full border-2 ${borderColor} shadow-lg overflow-hidden bg-white relative ${pulseClass}">
            <img 
              src="${profile?.profile_image_url || '/placeholder.svg'}" 
              alt=""
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusColor} border-2 border-white rounded-full"></div>
            ${hasSharedEvents ? '<div class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white flex items-center justify-center"><span class="text-white text-[8px]">🎯</span></div>' : ''}
            ${isOpenToHangStatus && userMood ? `<div class="absolute top-0 left-0 w-4 h-4 bg-white/90 rounded-full border border-white flex items-center justify-center"><span class="text-[10px]">${getMoodEmoji(userMood)}</span></div>` : ''}
            ${isOpenToHangStatus && !userMood ? '<div class="absolute top-0 left-0 w-2 h-2 bg-pink-500 rounded-full border border-white flex items-center justify-center"><span class="text-white text-[8px]">💕</span></div>' : ''}
          </div>
        `,
        className: `user-location-marker ${hasSharedEvents ? 'highlighted-match' : ''} ${isOpenToHangStatus ? 'open-to-hang' : ''}`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
        riseOnHover: true
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div dir="ltr" class="text-left text-sm">
            <div class="flex items-center gap-2">
              <img 
                src="${profile?.profile_image_url || '/placeholder.svg'}" 
                alt=""
                class="w-6 h-6 rounded-full object-cover"
                loading="lazy"
              />
              <span class="font-medium">${profile?.name || 'User'}</span>
            </div>
            ${hasSharedEvents ? `
              <div class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
                🎯 This user is going to the same event as you: ${(userLocation as any).sharedEvents[0]}
              </div>
            ` : ''}
            ${isOpenToHangStatus && userMood ? `
              <div class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                ${getMoodEmoji(userMood)} In a ${userMood} mood
              </div>
            ` : ''}
            ${isOpenToHangStatus && !userMood ? `
              <div class="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full mt-1">
                💕 Open to hang out right now!
              </div>
            ` : ''}
          </div>
        `);

      userMarkersRef.current.push(marker);
    });
  };

  // Function to offset overlapping markers
  const offsetOverlappingMarkers = (items: any[]) => {
    const locationGroups: { [key: string]: any[] } = {};
    
    // Group items by location
    items.forEach(item => {
      const locationKey = item.location || 'unknown';
      if (!locationGroups[locationKey]) {
        locationGroups[locationKey] = [];
      }
      locationGroups[locationKey].push(item);
    });
    
    // Offset overlapping items
    const offsetItems: any[] = [];
    Object.values(locationGroups).forEach(group => {
      if (group.length === 1) {
        offsetItems.push(group[0]);
      } else {
        // Multiple items at same location - create circular offset
        group.forEach((item, index) => {
          const angle = (2 * Math.PI * index) / group.length;
          const radius = 0.003; // Small radius for offset (~300m)
          
          try {
            const baseLocation = JSON.parse(item.location);
            const offsetLat = baseLocation.lat + radius * Math.cos(angle);
            const offsetLng = baseLocation.lng + radius * Math.sin(angle);
            
            offsetItems.push({
              ...item,
              offsetLocation: JSON.stringify({ lat: offsetLat, lng: offsetLng })
            });
          } catch (error) {
            offsetItems.push(item);
          }
        });
      }
    });
    
    return offsetItems;
  };

  // Function to add text pin markers - removed event and meetup markers
  const addTextPinMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing recommendation markers
    recommendationMarkersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    recommendationMarkersRef.current = [];

    // Only show recommendations (users will see them through text pins)
    if (userRecommendations.length > 0) {
      const offsetRecommendations = offsetOverlappingMarkers(userRecommendations);
      
      offsetRecommendations.forEach((recommendation) => {
        if (!mapInstanceRef.current) return;

        try {
          const location = recommendation.offsetLocation ? JSON.parse(recommendation.offsetLocation) : JSON.parse(recommendation.location);
          
          if (!location.lat || !location.lng) return;

          const recommendationIcon = L.divIcon({
            html: `
              <div class="relative">
                <div class="bg-white rounded-lg px-3 py-2 shadow-lg border border-gray-200 text-xs font-medium text-gray-800 max-w-[150px]">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span class="truncate">${recommendation.title}</span>
                  </div>
                </div>
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
              </div>
            `,
            className: 'recommendation-text-pin',
            iconSize: [150, 40],
            iconAnchor: [75, 40],
            popupAnchor: [0, -40]
          });

          const marker = L.marker([location.lat, location.lng], { 
            icon: recommendationIcon,
            riseOnHover: true 
          })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div dir="ltr" class="text-left text-sm">
                <div class="font-medium">${recommendation.title}</div>
                <div class="text-gray-600 mt-1">${recommendation.description}</div>
                <div class="text-green-600 text-xs mt-2">💡 Recommendation</div>
              </div>
            `);

          recommendationMarkersRef.current.push(marker);
        } catch (error) {
          console.error('Error parsing recommendation location:', error);
        }
      });
    }
  };

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        if (!mapContainer.current) return;

        // Remove existing map if it exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainer.current, {
          center: [-34.6118, -58.3960], // Buenos Aires coordinates
          zoom: 13,
          zoomControl: true,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
        console.log('Map initialized successfully');
        
        setError(null);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load map');
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize map with small delay
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when user locations or hang status changes
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      if (filteredUsers.length > 0) {
        // Show filtered users when there's an active filter
        addUserLocationMarkers(filteredUsers);
      } else {
        // Show all users when no filter is active
        addUserLocationMarkers();
      }
    }
  }, [userLocations, isLoading]);

  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      addTextPinMarkers();
    }
  }, [isLoading, allEvents, allMeetups, mapFilter]); // Add mapFilter dependency

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-20">
      <Header 
        title="Discover"
        onNeighborhoodChange={handleNeighborhoodChange}
      />
      
      <main className="container mx-auto px-4 py-3 space-y-6">
        {/* Enhanced Discovery Controls */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiscovery(true)}
            className="flex-1 btn-3d bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 hover:from-emerald-600 hover:to-teal-700 font-medium"
          >
            <Search className="w-4 h-4 mr-2" />
            Discover People
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPeopleYouShouldMeet(true)}
            className="flex-1 btn-3d bg-gradient-to-r from-orange-500 to-pink-600 text-white border-0 hover:from-orange-600 hover:to-pink-700 font-medium"
          >
            <Users className="w-4 h-4 mr-2" />
            Suggested
          </Button>
        </div>

        {/* Enhanced Mood Filter - only show when open to hang */}
        {isOpenToHang && (
          <div className="card-3d p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/30">
            <MoodFilterStrip 
              selectedMood={selectedMood} 
              onMoodChange={handleMoodFilterChange}
            />
          </div>
        )}

        {/* Enhanced Map Container */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-white to-gray-50">
          <div className="h-[calc(100vh-280px)] relative">
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none z-10" />
            
            {error ? (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-orange-50">
                <div className="text-center p-6">
                  <div className="card-3d p-4 rounded-2xl border-red-200 bg-red-50">
                    <p className="text-red-600 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="card-elevated p-6 rounded-2xl">
                      <div className="text-center">
                        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-700 font-medium">Loading map...</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={mapContainer} className="w-full h-full relative z-0" />
              </>
            )}
            
            {/* Enhanced Floating Action Buttons */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-4 z-30">
              {/* Map Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMapFilter(mapFilter === 'all' ? 'events' : mapFilter === 'events' ? 'meetups' : 'all')}
                className="btn-3d bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 px-4 py-2 font-medium shadow-xl"
              >
                <Filter className="w-4 h-4 mr-2" />
                <span className="text-sm capitalize">
                  {mapFilter === 'all' ? 'All' : mapFilter}
                </span>
              </Button>

              <div className="transform hover:scale-105 transition-all duration-300">
                <OpenToHangButton 
                  onMoodChange={handleMoodFilterChange}
                  isOpenToHang={isOpenToHang}
                  setIsOpenToHang={setIsOpenToHang}
                />
              </div>
            </div>

            {/* Enhanced Add Recommendation Card */}
            <div className="absolute bottom-6 left-6 z-30 transform hover:scale-105 transition-all duration-300">
              <div className="card-elevated rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
                <AddRecommendationCard />
              </div>
            </div>
          </div>
        </div>

        {/* Discovery Popup */}
        <DiscoveryPopup 
          isOpen={showDiscovery}
          onClose={() => setShowDiscovery(false)}
          onDiscover={handleDiscovery}
        />

        {/* People You Should Meet Popup */}
        <PeopleYouShouldMeetPopup
          isOpen={showPeopleYouShouldMeet}
          onClose={() => setShowPeopleYouShouldMeet(false)}
          suggestedUsers={suggestedUsers}
          loading={suggestedUsersLoading}
        />

      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default DiscoverPage;