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
  const addTextPinMarkers = async () => {
    if (!mapInstanceRef.current) return;

    // Clear existing recommendation markers
    if (recommendationMarkersRef.current.length > 0) {
      recommendationMarkersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      recommendationMarkersRef.current = [];
    }

    // No longer adding event and meetup markers per user request
    setUserRecommendations([]);
  };

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        setIsLoading(true);
        
        // Buenos Aires coordinates - center of the city
        const buenosAiresCenter: [number, number] = [-34.6118, -58.3960];

        // Create map with Leaflet
        const map = L.map(mapContainer.current, {
          zoomControl: true,
          attributionControl: true,
          fadeAnimation: true,
          zoomAnimation: true,
        }).setView(buenosAiresCenter, 12);
        
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 10,
        }).addTo(map);

        // Popular neighborhoods in Buenos Aires
        const neighborhoods = [
          { name: "Palermo", lat: -34.5870, lng: -58.4263, color: '#BB31E9' },
          { name: "Palermo Soho", lat: -34.5906, lng: -58.4203, color: '#9B59B6' },
          { name: "Palermo Hollywood", lat: -34.5834, lng: -58.4323, color: '#8E44AD' },
          { name: "San Telmo", lat: -34.6202, lng: -58.3731, color: '#FF6B6B' },
          { name: "Recoleta", lat: -34.5885, lng: -58.3967, color: '#45B7D1' },
          { name: "Villa Crespo", lat: -34.5998, lng: -58.4386, color: '#FFA726' },
        ];

        // Add Buenos Aires center marker
        L.marker(buenosAiresCenter)
          .addTo(map)
          .bindPopup('Buenos Aires');

        // Add user location and text pin markers
        addUserLocationMarkers();
        addTextPinMarkers();

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Error loading map');
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
      console.log('Updating markers based on hang status:', isOpenToHang);
      // Reset mood filter when not open to hang
      if (!isOpenToHang) {
        setSelectedMood('all');
        setFilteredUsers([]);
      }
      addUserLocationMarkers();
    }
  }, [userLocations, isOpenToHang, selectedMood]);
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      addUserLocationMarkers();
    }
  }, [userLocations, isLoading]);

  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      addTextPinMarkers();
    }
  }, [isLoading, allEvents, allMeetups, mapFilter]); // Add mapFilter dependency

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pb-20">
      <Header 
        title="Map"
        onNeighborhoodChange={handleNeighborhoodChange}
      />
      
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Open to Hang Button */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-60"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <OpenToHangButton 
                size="default" 
                shareText="Open to Hang" 
                removeText="Stop Hanging" 
                className="w-40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" 
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md leading-relaxed">
            Share your live location to discover nearby people ready to hang out right now
          </p>
        </div>
        
        {/* Map Section */}
        <div className="relative">

          {/* People You Should Meet Row - Only show if there are suggested users */}
          {!suggestedUsersLoading && suggestedUsers.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  People You Should Meet
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={findSuggestedUsers}
                  className="bg-white/90 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Refresh
                </Button>
              </div>
              
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                {suggestedUsers.slice(0, 10).map((user) => (
                  <div key={user.id} className="flex-shrink-0 text-center group">
                    <div className="relative">
                      <div className="w-24 h-24 p-1 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.05] active:scale-[0.98]">
                        <img
                          src={user.profile_image_url || '/placeholder-avatar.png'}
                          alt={user.name}
                          className="w-full h-full rounded-[1.25rem] object-cover border-2 border-white cursor-pointer"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-avatar.png';
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold mt-3 max-w-[90px] truncate text-center">{user.name}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <p className="text-xs font-medium text-muted-foreground">{user.sharedEventCount}</p>
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="relative bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/30 h-[500px] z-0 max-w-none -mx-2 [&>.leaflet-container]:z-0">
            {/* Filtered Users Display */}
            {filteredUsers.length > 0 && (
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-xl">
                  <h3 className="text-base font-bold mb-3 text-foreground">Matching Users ({filteredUsers.length})</h3>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                    {filteredUsers.slice(0, 6).map((userLocation) => (
                      <div key={userLocation.profile.id} className="flex-shrink-0 flex items-center gap-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl px-4 py-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                        <img 
                          src={userLocation.profile.profile_image_url || '/placeholder.svg'} 
                          alt={userLocation.profile.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <span className="text-sm font-semibold text-foreground">{userLocation.profile.name}</span>
                      </div>
                    ))}
                    {filteredUsers.length > 6 && (
                      <div className="flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl w-12 h-12 shadow-lg">
                        <span className="text-sm font-bold text-primary">+{filteredUsers.length - 6}</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setFilteredUsers([]);
                      addUserLocationMarkers();
                    }}
                    className="mt-4 text-sm bg-white/90 border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Show All Users
                  </Button>
                </div>
              </div>
            )}

            {error ? (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted/20 to-muted/10 backdrop-blur-sm">
                <div className="text-center p-6 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30">
                  <p className="text-base font-medium text-destructive">{error}</p>
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 bg-background/90 backdrop-blur-lg flex items-center justify-center z-10">
                    <div className="text-center bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-base font-medium text-foreground/80">Loading map...</p>
                    </div>
                  </div>
                )}
                <div ref={mapContainer} className="w-full h-full relative z-0" style={{
                  filter: 'contrast(1.05) saturate(1.1)',
                }} />
              </>
            )}
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