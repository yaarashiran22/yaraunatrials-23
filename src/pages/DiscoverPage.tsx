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
import { useUserLocations } from '@/hooks/useUserLocations';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
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
  const { userLocations } = useUserLocations();
  const { user } = useAuth();
  const { events: allEvents } = useEvents();
  const { events: allMeetups } = useEvents('meetup');
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
      const isHighlighted = highlightedUsers.some(hu => hu.profile?.id === profile?.id);

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
            ${profile?.interests && profile.interests.length > 0 ? `
              <div class="mt-2">
                <div class="text-xs text-gray-500 mb-1">Interests:</div>
                <div class="flex flex-wrap gap-1">
                  ${profile.interests.slice(0, 3).map((interest: string) => 
                    `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${interest}</span>`
                  ).join('')}
                </div>
              </div>
            ` : ''}
            <div class="text-xs text-muted-foreground mt-1">
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 ${hasSharedEvents ? 'bg-red-500' : 'bg-green-500'} rounded-full"></div>
                ${hasSharedEvents ? 'Same event + shared interests' : 'Shared interests match'}
              </div>
            </div>
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
      
      if (filterType === 'event') {
        // Use events from the home page (useEvents hook) and add neighborhood-based location
        items = allEvents.map(event => ({
          ...event,
          category: 'event',
          description: event.description || event.title,
          // Map event location to neighborhood coordinates for display on map
          location: event.location ? JSON.stringify(getNeighborhoodCoordinates(event.location)) : null
        }));
      } else if (filterType === 'meet') {
        // Use meetups from the home page (useEvents hook) and add neighborhood-based location  
        items = allMeetups.map(meetup => ({
          ...meetup,
          category: 'meetup',
          description: meetup.description || meetup.title,
          // Map meetup location to neighborhood coordinates for display on map
          location: meetup.location ? JSON.stringify(getNeighborhoodCoordinates(meetup.location)) : null
        }));
      } else {
        // Original logic for text pins and other filters
        let query = supabase
          .from('items')
          .select('*')
          .eq('category', 'text_pin')
          .eq('status', 'active');

        if (filterType === 'friends' && user?.id) {
          // Get user's friends
          const { data: friendsData, error: friendsError } = await supabase
            .from('user_friends')
            .select('friend_id')
            .eq('user_id', user.id);

          if (friendsError) {
            console.error('Error fetching friends:', friendsError);
            return;
          }

          const friendIds = friendsData?.map(f => f.friend_id) || [];
          if (friendIds.length > 0) {
            const { data, error } = await query.in('user_id', friendIds);
            if (error) throw error;
            items = data || [];
          }
        } else if (filterType === 'following' && user?.id) {
          // Get users the current user is following
          const { data: followingData, error: followingError } = await supabase
            .from('user_following')
            .select('following_id')
            .eq('follower_id', user.id);

          if (followingError) {
            console.error('Error fetching following:', followingError);
            return;
          }

          const followingIds = followingData?.map(f => f.following_id) || [];
          if (followingIds.length > 0) {
            const { data, error } = await query.in('user_id', followingIds);
            if (error) throw error;
            items = data || [];
          }
        } else {
          // Show all text pins
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
                  width: 160px;
                  max-width: 160px;
                  font-family: system-ui, -apple-system, sans-serif;
                  background: transparent;
                  border-radius: 16px;
                  padding: 8px;
                  margin: 0;
                  border: none;
                  box-shadow: none;
                }
                .text-pin-popup .pin-text {
                  font-size: 11px;
                  line-height: 1.3;
                  color: #1f2937;
                  margin-bottom: 4px;
                  white-space: pre-wrap;
                  text-align: center;
                  background: rgba(255,255,255,0.9);
                  padding: 6px 8px;
                  border-radius: 8px;
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
              <div class="pin-text">${item.description || item.title || 'No message'}</div>
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
          `, { maxWidth: 180, className: 'custom-popup' });

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

        // Add neighborhood markers
        neighborhoods.forEach(neighborhood => {
          // Create custom marker
          const markerElement = document.createElement('div');
          markerElement.style.cssText = `
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: ${neighborhood.color};
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s ease;
          `;

          const customIcon = L.divIcon({
            html: markerElement.outerHTML,
            className: 'custom-location-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
          });

          L.marker([neighborhood.lat, neighborhood.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-center p-2">
                <strong class="text-gray-800 block">${neighborhood.name}</strong>
              </div>
            `);
        });

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
  }, [isLoading, filterType, allEvents, allMeetups]); // Add events and meetups dependencies

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
          {/* Filter buttons for events and meetups */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={filterType === 'meet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('meet')}
              className="text-xs"
            >
              Meetups
            </Button>
            <Button
              variant={filterType === 'event' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('event')}
              className="text-xs"
            >
              Events
            </Button>
            <Button
              variant={filterType === 'friends' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('friends')}
              className="text-xs"
            >
              Friends
            </Button>
            <Button
              variant={filterType === 'following' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('following')}
              className="text-xs"
            >
              Following
            </Button>
          </div>
          
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

          <div className="flex items-center justify-between mt-4">
            <AddRecommendationCard onRecommendationAdded={addTextPinMarkers} className="w-20" />
            <LocationShareButton size="sm" shareText="Share Location" removeText="Remove Location" className="w-32 text-xs" />
          </div>
        </div>

        {/* Discovery Popup */}
        <DiscoveryPopup 
          isOpen={showDiscovery}
          onClose={() => setShowDiscovery(false)}
          onDiscover={handleDiscovery}
        />

      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default DiscoverPage;