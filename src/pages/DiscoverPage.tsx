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
        const userSpecialities = profile.specialties || [];
        const allUserInterests = [...userInterests, ...userSpecialities];
        
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

  const addTextPinMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing recommendation markers
    if (recommendationMarkersRef.current.length > 0) {
      recommendationMarkersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      recommendationMarkersRef.current = [];
    }

    // Combine events and meetups
    let itemsToShow: any[] = [];
    
    if (mapFilter === 'all' || mapFilter === 'events') {
      itemsToShow = [...itemsToShow, ...allEvents];
    }
    
    if (mapFilter === 'all' || mapFilter === 'meetups') {
      itemsToShow = [...itemsToShow, ...allMeetups];
    }

    // Only show items with valid location data
    const itemsWithLocation = itemsToShow.filter(item => {
      try {
        if (item.location && typeof item.location === 'string') {
          const parsed = JSON.parse(item.location);
          return parsed.lat && parsed.lng;
        }
      } catch (error) {
        console.error('Error parsing location for item:', item.id, error);
      }
      return false;
    });

    // Offset overlapping markers
    const offsetItems = offsetOverlappingMarkers(itemsWithLocation);

    offsetItems.forEach((item) => {
      if (!mapInstanceRef.current) return;

      try {
        const locationData = JSON.parse(item.offsetLocation || item.location);
        const { lat, lng } = locationData;

        if (!lat || !lng) return;

        const isEvent = !item.event_type || item.event_type === 'event';
        const iconColor = isEvent ? 'bg-primary' : 'bg-orange-500';
        const iconText = isEvent ? '📅' : '🤝';
        
        const textIcon = L.divIcon({
          html: `
            <div class="flex flex-col items-center">
              <div class="w-6 h-6 ${iconColor} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">
                ${iconText}
              </div>
              <div class="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-foreground shadow-lg border border-border mt-1 max-w-[120px] truncate">
                ${item.title}
              </div>
            </div>
          `,
          className: 'text-pin-marker',
          iconSize: [120, 50],
          iconAnchor: [60, 25],
          popupAnchor: [0, -25]
        });

        const marker = L.marker([lat, lng], {
          icon: textIcon,
          riseOnHover: true
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div dir="ltr" class="text-left text-sm max-w-[200px]">
              <h3 class="font-semibold text-foreground mb-2">${item.title}</h3>
              ${item.description ? `<p class="text-muted-foreground text-xs mb-2">${item.description}</p>` : ''}
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>${item.date || 'Date TBD'}</span>
              </div>
              ${item.price ? `
                <div class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span class="font-medium">Price: ${item.price}</span>
                </div>
              ` : ''}
            </div>
          `);

        recommendationMarkersRef.current.push(marker);
      } catch (error) {
        console.error('Error creating marker for item:', item.id, error);
      }
    });
  };

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        const map = L.map(mapContainer.current, {
          center: [-34.6118, -58.3960], // Buenos Aires center
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          boxZoom: false,
          keyboard: true,
        });

        // Add base tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          detectRetina: true,
        }).addTo(map);

        mapInstanceRef.current = map;
        setIsLoading(false);

        // Wait for map to be fully loaded before adding markers
        map.whenReady(() => {
          console.log('Map is ready, adding initial markers');
          addUserLocationMarkers();
          addTextPinMarkers();
        });

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
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Discover"
        onNeighborhoodChange={handleNeighborhoodChange}
      />
      
      <main className="px-4 py-4 space-y-6 max-w-md mx-auto lg:max-w-none">
        
        {/* Share Location Section */}
        <section className="text-center">
          <div className="mb-4">
            <h2 className="title-section mb-2">share your location</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Let nearby people know when you're open to hang out
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
            <OpenToHangButton 
              size="default" 
              shareText="I'm Open to Hang" 
              removeText="Stop Sharing" 
              className="w-full rounded-full" 
            />
          </div>
        </section>

        {/* Mood Filter - Only show when open to hang */}
        {isOpenToHang && (
          <section>
            <h3 className="text-sm font-semibold mb-3 px-1">What's your mood?</h3>
            <MoodFilterStrip 
              onFilterChange={handleMoodFilterChange}
              showTitle={false}
            />
          </section>
        )}

        {/* People You Should Meet - Only show if there are suggested users */}
        {!suggestedUsersLoading && suggestedUsers.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="title-section">people you should meet</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={findSuggestedUsers}
                className="rounded-full border-black text-xs px-3 py-1 h-7"
              >
                Refresh
              </Button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
              {suggestedUsers.slice(0, 8).map((user) => (
                <div key={user.id} className="flex-shrink-0 text-center">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 rounded-full border-2 border-primary overflow-hidden bg-white shadow-sm">
                      <img
                        src={user.profile_image_url || '/placeholder-avatar.png'}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-avatar.png';
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium max-w-[60px] truncate text-center">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.sharedEventCount} events</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Map Controls */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="title-section">nearby map</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiscovery(true)}
                className="rounded-full border-black text-xs px-3 py-1 h-7"
              >
                <Search className="h-3 w-3 mr-1" />
                Discover
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMapFilter(mapFilter === 'all' ? 'events' : mapFilter === 'events' ? 'meetups' : 'all');
                }}
                className="rounded-full border-black text-xs px-3 py-1 h-7"
              >
                <Filter className="h-3 w-3 mr-1" />
                {mapFilter === 'all' ? 'All' : mapFilter === 'events' ? 'Events' : 'Meetups'}
              </Button>
            </div>
          </div>
          
          {/* Map Container */}
          <div className="relative bg-white rounded-2xl overflow-hidden border border-border shadow-sm h-[400px] z-10">
            {/* Filtered Users Display */}
            {filteredUsers.length > 0 && (
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 border border-border shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Found {filteredUsers.length} matches</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setFilteredUsers([]);
                        addUserLocationMarkers();
                      }}
                      className="text-xs h-6 px-2"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {filteredUsers.slice(0, 5).map((userLocation) => (
                      <div key={userLocation.profile.id} className="flex-shrink-0 flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                        <img 
                          src={userLocation.profile.profile_image_url || '/placeholder.svg'} 
                          alt={userLocation.profile.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium">{userLocation.profile.name}</span>
                      </div>
                    ))}
                    {filteredUsers.length > 5 && (
                      <div className="flex-shrink-0 flex items-center justify-center bg-primary/10 rounded-full w-8 h-8">
                        <span className="text-xs font-semibold text-primary">+{filteredUsers.length - 5}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-4">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                )}
                <div ref={mapContainer} className="w-full h-full z-0" />
              </>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="title-section mb-4">quick actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDiscovery(true)}
              className="h-16 flex-col gap-2 rounded-2xl border-border"
            >
              <Search className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Find People</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => suggestedUsers.length > 0 ? setShowPeopleYouShouldMeet(true) : findSuggestedUsers()}
              className="h-16 flex-col gap-2 rounded-2xl border-border"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Suggestions</span>
            </Button>
          </div>
        </section>

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
