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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 pb-20 relative overflow-hidden">
      {/* Background texture overlay */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(var(--accent)) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 40% 80%, hsl(var(--coral)) 0%, transparent 50%)' }} />
      
      <Header 
        title="Discover"
        onNeighborhoodChange={handleNeighborhoodChange}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-8 relative z-10">
        
        {/* Hero Section with Open to Hang */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-card/80 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-floating border border-border/50">
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse-glow"></div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent">
              Find Your Vibe
            </h1>
            <div className="w-3 h-3 bg-coral rounded-full animate-pulse-glow"></div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <OpenToHangButton 
              size="lg" 
              shareText="Share My Location" 
              removeText="Stop Sharing" 
              className="px-8 py-3 text-sm font-semibold bg-gradient-to-r from-accent to-coral hover:from-coral hover:to-accent transition-all duration-300 border-0 shadow-medium hover:shadow-floating transform hover:scale-105"
            />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Connect with like-minded people in your neighborhood who are ready to hang out right now
            </p>
          </div>
        </div>

        {/* People You Should Meet - Enhanced Design */}
        {!suggestedUsersLoading && suggestedUsers.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-coral rounded-full flex items-center justify-center shadow-medium">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">People You Should Meet</h2>
                  <p className="text-sm text-muted-foreground">Based on shared interests & events</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={findSuggestedUsers}
                className="bg-card/50 backdrop-blur-sm border-accent/30 hover:bg-accent/10 hover:border-accent transition-all duration-300"
              >
                <Search className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-accent/20 hover:scrollbar-thumb-accent/40">
              {suggestedUsers.slice(0, 10).map((user) => (
                <div key={user.id} className="flex-shrink-0 text-center group">
                  <div className="relative transform transition-all duration-300 group-hover:scale-105">
                    <div className="w-24 h-24 p-1 bg-gradient-to-br from-accent via-coral to-accent rounded-2xl shadow-medium group-hover:shadow-floating transition-all duration-300">
                      <img
                        src={user.profile_image_url || '/placeholder-avatar.png'}
                        alt={user.name}
                        className="w-full h-full rounded-xl object-cover border-2 border-white/50 cursor-pointer"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-avatar.png';
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-accent to-coral rounded-full border-3 border-white flex items-center justify-center animate-bounce-subtle shadow-medium">
                      <span className="text-white text-sm font-bold">✨</span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-semibold max-w-[90px] truncate text-center text-foreground">{user.name}</p>
                    <div className="flex items-center justify-center gap-2 bg-accent/10 rounded-full px-3 py-1">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse-glow"></div>
                      <p className="text-xs font-medium text-accent">{user.sharedEventCount} shared</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Enhanced Map Section */}
        <div className="relative">
          <div className="bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-floating border border-border/30 h-[600px] relative group">
            {/* Map overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-accent/5 z-10 pointer-events-none rounded-3xl" />
            
            {/* Filtered Users Display - Enhanced */}
            {filteredUsers.length > 0 && (
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <div className="bg-card/95 backdrop-blur-xl rounded-2xl p-4 border border-accent/20 shadow-floating">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent to-coral rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{filteredUsers.length}</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Perfect Matches Found</h3>
                  </div>
                  
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {filteredUsers.slice(0, 6).map((userLocation) => (
                      <div key={userLocation.profile.id} className="flex-shrink-0 flex items-center gap-3 bg-gradient-to-r from-accent/10 to-coral/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-accent/20">
                        <img 
                          src={userLocation.profile.profile_image_url || '/placeholder.svg'} 
                          alt={userLocation.profile.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white/50"
                        />
                        <span className="text-sm font-semibold text-foreground">{userLocation.profile.name}</span>
                      </div>
                    ))}
                    {filteredUsers.length > 6 && (
                      <div className="flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-muted to-accent/20 rounded-2xl w-12 h-12 border border-accent/20">
                        <span className="text-sm font-bold text-accent">+{filteredUsers.length - 6}</span>
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
                    className="mt-3 bg-accent/10 border-accent/30 hover:bg-accent/20 text-accent font-medium transition-all duration-300"
                  >
                    Show All Users
                  </Button>
                </div>
              </div>
            )}

            {error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 bg-card/80 backdrop-blur-xl rounded-2xl border border-destructive/20">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-foreground font-medium">{error}</p>
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 bg-card/90 backdrop-blur-xl flex items-center justify-center z-30 rounded-3xl">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 relative mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent to-coral rounded-full animate-spin"></div>
                        <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-accent animate-pulse-glow" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-foreground">Loading your world...</p>
                        <p className="text-sm text-muted-foreground">Finding amazing people nearby</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={mapContainer} className="w-full h-full relative z-0 rounded-3xl" />
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