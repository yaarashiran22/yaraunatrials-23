import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Users, Calendar, Coffee, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from "@/components/Header";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import BottomNavigation from "@/components/BottomNavigation";
import LocationShareButton from '@/components/LocationShareButton';
import AddRecommendationCard from "@/components/AddRecommendationCard";
import MoodFilterStrip from '@/components/MoodFilterStrip';
import DiscoveryPopup from '@/components/DiscoveryPopup';
import PeopleYouShouldMeetPopup from '@/components/PeopleYouShouldMeetPopup';
import { useUserLocations } from '@/hooks/useUserLocations';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { useSuggestedUsers } from '@/hooks/useSuggestedUsers';
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
  const { userLocations } = useUserLocations();
  const { user } = useAuth();
  const { events: allEvents } = useEvents();
  const { events: allMeetups } = useEvents('meetup');
  const { suggestedUsers, loading: suggestedUsersLoading, findSuggestedUsers } = useSuggestedUsers();
  const [userRecommendations, setUserRecommendations] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'friends' | 'following' | 'meet' | 'event'>('meet');

  // Function to filter users based on discovery criteria
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

    console.log('Adding user location markers, count:', usersToShow.length);

    // Clear existing user markers
    if (userMarkersRef.current.length > 0) {
      userMarkersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      userMarkersRef.current = [];
    }

    // Add markers for each user location
    usersToShow.forEach((userLocation) => {
      if (!mapInstanceRef.current) return;

      console.log('Adding marker for user:', userLocation.profile?.name, 'at:', userLocation.latitude, userLocation.longitude);

      const profile = userLocation.profile as any;
      const hasSharedEvents = (userLocation as any).sharedEvents && (userLocation as any).sharedEvents.length > 0;

      // Create custom user icon with highlighting for users with shared events
      const userIcon = L.divIcon({
        html: `
          <div class="w-8 h-8 rounded-full border-2 ${hasSharedEvents ? 'border-red-500' : 'border-white'} shadow-lg overflow-hidden bg-white relative ${hasSharedEvents ? 'animate-pulse' : ''}">
            <img 
              src="${profile?.profile_image_url || '/placeholder.svg'}" 
              alt=""
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 ${hasSharedEvents ? 'bg-red-500' : 'bg-green-500'} border-2 border-white rounded-full"></div>
            ${hasSharedEvents ? '<div class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white flex items-center justify-center"><span class="text-white text-[8px]">🎯</span></div>' : ''}
          </div>
        `,
        className: `user-location-marker ${hasSharedEvents ? 'highlighted-match' : ''}`,
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
          </div>
        `);

      userMarkersRef.current.push(marker);
    });
  };

  // Function to add text pin markers
  const addTextPinMarkers = async () => {
    if (!mapInstanceRef.current) return;

    // Clear existing recommendation markers
    if (recommendationMarkersRef.current.length > 0) {
      recommendationMarkersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      recommendationMarkersRef.current = [];
    }

    try {
      let items: any[] = [];
      
      // Show all events and meetups together
      const eventItems = allEvents.map(event => ({
        ...event,
        category: 'event',
        description: event.description || event.title,
        location: event.location ? JSON.stringify(getNeighborhoodCoordinates(event.location)) : null
      }));
      
      const meetupItems = allMeetups.map(meetup => ({
        ...meetup,
        category: 'meetup',
        description: meetup.description || meetup.title,
        location: meetup.location ? JSON.stringify(getNeighborhoodCoordinates(meetup.location)) : null
      }));
      
      items = [...eventItems, ...meetupItems];

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

      // Add markers for items
      for (const item of itemsWithProfiles) {
        if (!mapInstanceRef.current) continue;

        let lat, lng;
        try {
          if (item.location) {
            const locationData = JSON.parse(item.location);
            lat = locationData.lat;
            lng = locationData.lng;
          }
        } catch (error) {
          console.error('Error parsing location data:', error);
          continue;
        }

        if (!lat || !lng) continue;

        // Create custom icon based on item type
        const getIconColor = (category: string) => {
          switch (category) {
            case 'event': return '#FF6B6B';
            case 'meetup':
            case 'social':
            case 'community': return '#FFA726';
            default: return '#4F46E5';
          }
        };

        const iconColor = getIconColor(item.category);

        // Create custom text pin icon using uploaded image or fallback
        const itemIcon = L.divIcon({
          html: item.image_url ? `
            <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden relative">
              <img 
                src="${item.image_url}" 
                alt="${item.category} image"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 border border-white rounded-full flex items-center justify-center" style="background-color: ${iconColor}">
                <div class="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          ` : `
            <div class="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center relative" style="background-color: ${iconColor}">
              <div class="w-2 h-2 bg-white rounded-full"></div>
              <div class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 border border-white rounded-full flex items-center justify-center">
                <div class="w-1 h-1 bg-green-600 rounded-full"></div>
              </div>
            </div>
          `,
          className: `${item.category}-marker`,
          iconSize: item.image_url ? [32, 32] : [24, 24],
          iconAnchor: item.image_url ? [16, 32] : [12, 24],
          popupAnchor: item.image_url ? [0, -32] : [0, -24]
        });

        const marker = L.marker([lat, lng], {
          icon: itemIcon,
          riseOnHover: true
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div dir="ltr" class="text-pin-popup">
              <style>
                .text-pin-popup {
                  text-align: center;
                  width: 200px;
                  max-width: 200px;
                  font-family: system-ui, -apple-system, sans-serif;
                  background: transparent;
                  border-radius: 16px;
                  padding: 8px;
                  margin: 0;
                  border: none;
                  box-shadow: none;
                }
                .text-pin-popup .pin-image {
                  width: 100%;
                  height: 100px;
                  object-fit: cover;
                  border-radius: 8px;
                  margin-bottom: 8px;
                }
                .text-pin-popup .pin-text {
                  font-size: 12px;
                  line-height: 1.3;
                  color: #1f2937;
                  margin-bottom: 6px;
                  white-space: pre-wrap;
                  text-align: center;
                  background: rgba(255,255,255,0.9);
                  padding: 6px 8px;
                  border-radius: 8px;
                  backdrop-filter: blur(4px);
                  font-weight: 600;
                }
                .text-pin-popup .pin-details {
                  font-size: 10px;
                  line-height: 1.2;
                  color: #4b5563;
                  margin-bottom: 4px;
                  background: rgba(255,255,255,0.8);
                  padding: 4px 6px;
                  border-radius: 6px;
                  backdrop-filter: blur(4px);
                }
                .text-pin-popup .pin-author {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 3px;
                  font-size: 9px;
                  color: #6b7280;
                  background: rgba(255,255,255,0.8);
                  padding: 2px 4px;
                  border-radius: 6px;
                  backdrop-filter: blur(4px);
                }
                .text-pin-popup .pin-author img {
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  object-fit: cover;
                }
              </style>
              ${item.image_url ? `<img src="${item.image_url}" alt="${item.title || 'Event image'}" class="pin-image" />` : ''}
              <div class="pin-text">${item.title || item.description || 'No title'}</div>
              ${(item.date || item.time) ? `
                <div class="pin-details">
                  ${item.date ? `📅 ${item.date}` : ''}
                  ${item.date && item.time ? ' • ' : ''}
                  ${item.time ? `🕐 ${item.time}` : ''}
                </div>
              ` : ''}
              ${item.location && typeof item.location === 'string' && !item.location.startsWith('{') ? `
                <div class="pin-details">📍 ${item.location}</div>
              ` : ''}
              ${item.profile ? `
                <div class="pin-author">
                  <img 
                    src="${item.profile.profile_image_url || '/placeholder.svg'}" 
                    alt=""
                  />
                  <span>by ${item.profile.name || 'User'}</span>
                </div>
              ` : ''}
            </div>
          `, { maxWidth: 220, className: 'custom-popup' });

        recommendationMarkersRef.current.push(marker);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
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

  // Update markers when data changes
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      addUserLocationMarkers();
    }
  }, [userLocations, isLoading]);

  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      addTextPinMarkers();
    }
  }, [isLoading, allEvents, allMeetups]); // Remove filterType dependency

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Map"
        onNeighborhoodChange={handleNeighborhoodChange}
      />
      
      
      <main className="container mx-auto px-4 py-3 space-y-6">
        {/* Mood Filter Strip */}
        <MoodFilterStrip onFilterChange={(filterId) => {
          console.log('Mood filter changed:', filterId);
          // Handle mood filter change if needed
        }} />
        
        {/* Map Section */}
        <div className="relative">
          {/* People You Should Meet Row - Only show if there are suggested users */}
          {!suggestedUsersLoading && suggestedUsers.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  People You Should Meet
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={findSuggestedUsers}
                  className="text-xs"
                >
                  Refresh
                </Button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
                {suggestedUsers.slice(0, 10).map((user) => (
                  <div key={user.id} className="flex-shrink-0 text-center group">
                    <div className="relative">
                      <div className="w-20 h-20 p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover-scale">
                        <img
                          src={user.profile_image_url || '/placeholder-avatar.png'}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover border-2 border-white cursor-pointer transition-transform duration-200 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-avatar.png';
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center animate-pulse">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium mt-2 max-w-[80px] truncate text-center">{user.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                      <p className="text-xs text-muted-foreground">{user.sharedEventCount}</p>
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="relative bg-card rounded-xl overflow-hidden shadow-card border h-[500px] z-0 max-w-none -mx-2 [&>.leaflet-container]:z-0">
            {/* Filtered Users Display */}
            {filteredUsers.length > 0 && (
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="bg-card/95 backdrop-blur-sm rounded-lg p-3 border border-border/20 shadow-lg">
                  <h3 className="text-sm font-semibold mb-2">Matching Users ({filteredUsers.length})</h3>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {filteredUsers.slice(0, 6).map((userLocation) => (
                      <div key={userLocation.profile.id} className="flex-shrink-0 flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                        <img 
                          src={userLocation.profile.profile_image_url || '/placeholder.svg'} 
                          alt={userLocation.profile.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium">{userLocation.profile.name}</span>
                      </div>
                    ))}
                    {filteredUsers.length > 6 && (
                      <div className="flex-shrink-0 flex items-center justify-center bg-muted/50 rounded-full w-8 h-8">
                        <span className="text-xs font-medium">+{filteredUsers.length - 6}</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setFilteredUsers([]);
                      addUserLocationMarkers();
                    }}
                    className="mt-2 text-xs"
                  >
                    Show All Users
                  </Button>
                </div>
              </div>
            )}

            {error ? (
              <div className="flex items-center justify-center h-full bg-muted/30">
                <div className="text-center p-4">
                  <p className="text-muted-foreground">{error}</p>
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-muted-foreground text-sm">Loading map...</p>
                    </div>
                  </div>
                )}
                <div ref={mapContainer} className="w-full h-full relative z-0" />
              </>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <LocationShareButton size="sm" shareText="Share Location" removeText="Remove Location" className="w-32 text-xs" />
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