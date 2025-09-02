import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserLocations } from '@/hooks/useUserLocations';
import { useEvents } from '@/hooks/useEvents';
import DiscoveryPopup from '@/components/DiscoveryPopup';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface BuenosAiresMapProps {
  className?: string;
}

const BuenosAiresMap = ({ className = "w-full h-64" }: BuenosAiresMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkersRef = useRef<L.Marker[]>([]);
  const eventMarkersRef = useRef<L.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const { userLocations } = useUserLocations();
  const { events } = useEvents();

  console.log('BuenosAiresMap: Component rendered, userLocations:', userLocations.length);

  // Function to spread out overlapping markers
  const spreadOverlappingMarkers = (items: any[], getCoords: (item: any) => [number, number]) => {
    const spread = 0.002; // Degrees to spread markers
    const grouped = new Map<string, any[]>();
    
    // Group items by approximate location
    items.forEach(item => {
      const [lat, lng] = getCoords(item);
      const key = `${Math.round(lat * 1000)}-${Math.round(lng * 1000)}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });
    
    // Spread overlapping items
    const result: Array<{item: any, coords: [number, number]}> = [];
    grouped.forEach(groupItems => {
      if (groupItems.length === 1) {
        result.push({
          item: groupItems[0], 
          coords: getCoords(groupItems[0])
        });
      } else {
        // Spread items in a circle
        groupItems.forEach((item, index) => {
          const [baseLat, baseLng] = getCoords(item);
          const angle = (2 * Math.PI * index) / groupItems.length;
          const newLat = baseLat + spread * Math.cos(angle);
          const newLng = baseLng + spread * Math.sin(angle);
          result.push({
            item,
            coords: [newLat, newLng]
          });
        });
      }
    });
    
    return result;
  };

  // Function to add event/meetup markers
  const addEventMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing event markers
    if (eventMarkersRef.current.length > 0) {
      eventMarkersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      eventMarkersRef.current = [];
    }

    // Filter events with location data
    const eventsWithCoords = events.filter(event => {
      if (!event.location) return false;
      // Simple coordinate detection - you might want to improve this with geocoding
      const coordMatch = event.location.match(/-?\d+\.?\d*,-?\d+\.?\d*/);
      return coordMatch;
    });

    // Spread overlapping events
    const spreadEvents = spreadOverlappingMarkers(
      eventsWithCoords,
      (event) => {
        const coords = event.location!.match(/-?\d+\.?\d*,-?\d+\.?\d*/)?.[0].split(',');
        return [parseFloat(coords![0]), parseFloat(coords![1])];
      }
    );

    spreadEvents.forEach(({item: event, coords}) => {
      if (!mapInstanceRef.current) return;

      const isEvent = event.event_type === 'event';
      const iconColor = isEvent ? '#FF6B6B' : '#45B7D1';
      const iconText = isEvent ? '🎉' : '🤝';

      const eventIcon = L.divIcon({
        html: `
          <div class="w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-lg font-bold" 
               style="background-color: ${iconColor}; color: white;">
            ${iconText}
          </div>
        `,
        className: 'event-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      const marker = L.marker(coords, {
        icon: eventIcon,
        riseOnHover: true
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="text-center p-2 max-w-xs">
            <h3 class="font-bold text-sm mb-1">${event.title}</h3>
            <p class="text-xs text-gray-600 mb-2">${event.description || ''}</p>
            <div class="text-xs">
              <div><strong>Date:</strong> ${event.date || 'TBD'}</div>
              <div><strong>Time:</strong> ${event.time || 'TBD'}</div>
              <div><strong>Location:</strong> ${event.location || 'TBD'}</div>
              <div><strong>Price:</strong> ${event.price || 'Free'}</div>
            </div>
            <div class="mt-2 text-xs bg-gray-100 rounded px-2 py-1">
              <strong>${isEvent ? 'Event' : 'Meetup'}</strong> by ${event.uploader?.name}
            </div>
          </div>
        `);

      eventMarkersRef.current.push(marker);
    });

    console.log(`Added ${eventMarkersRef.current.length} event markers`);
  };

  // Function to filter users based on interests
  const handleDiscovery = (selectedInterests: string[], connectionType: string) => {
    
    const filtered = userLocations.filter(userLocation => {
      const profile = userLocation.profile as any;
      
      // Check interests match (check if profile has specialties property)
      const interestMatch = selectedInterests.length === 0 || 
        (profile.specialties && Array.isArray(profile.specialties) && selectedInterests.some(interest => 
          profile.specialties.some((specialty: string) => 
            specialty.toLowerCase().includes(interest.toLowerCase())
          )
        ));
      
      // Filter by connection type if profile has this information
      // Note: This assumes profiles might have a 'looking_for' field or similar
      // For now, we'll just log the connection type and filter by interests
      
      // If no filters are applied, show all users
      if (selectedInterests.length === 0) {
        return true;
      }
      
      return interestMatch;
    });
    
    setFilteredUsers(filtered);
    console.log('Filtered users:', filtered.length, 'Connection type:', connectionType);
    
    // Update markers to show only filtered users
    addUserLocationMarkers(filtered);
  };

  // Function to add user location markers - optimized for performance and shows "open to hang" users
  const addUserLocationMarkers = (usersToShow = userLocations) => {
    if (!mapInstanceRef.current) {
      console.log('BuenosAiresMap: No map instance available for adding markers');
      return;
    }

    console.log(`BuenosAiresMap: Adding markers for ${usersToShow.length} users open to hang`);

    // Clear existing user markers efficiently
    if (userMarkersRef.current.length > 0) {
      userMarkersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
      userMarkersRef.current = [];
    }

    // Spread overlapping user markers
    const spreadUsers = spreadOverlappingMarkers(
      usersToShow,
      (user) => [user.latitude, user.longitude]
    );

    // Add markers for each user location
    spreadUsers.forEach(({item: userLocation, coords}, index) => {
      if (!mapInstanceRef.current) return;

      console.log(`BuenosAiresMap: Adding marker ${index + 1} for open to hang user:`, userLocation.profile.name, 'at', coords);

      // Create optimized custom icon with pulsing effect for "open to hang" users
      const userIcon = L.divIcon({
        html: `
          <div class="relative">
            <div class="w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-white relative animate-pulse">
              <img 
                src="${userLocation.profile.profile_image_url || '/placeholder.svg'}" 
                alt=""
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-pink-500 border border-white rounded-full animate-ping"></div>
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-pink-500 border border-white rounded-full"></div>
          </div>
        `,
        className: 'user-location-marker open-to-hang',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker(coords, {
        icon: userIcon,
        riseOnHover: true
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div dir="rtl" class="text-right text-base">
            <div class="flex items-center gap-2">
              <img 
                src="${userLocation.profile.profile_image_url || '/placeholder.svg'}" 
                alt=""
                class="w-6 h-6 rounded-full object-cover"
                loading="lazy"
              />
              <span class="font-medium">${userLocation.profile.name || 'משתמש'}</span>
              <div class="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">Open to Hang! 💫</div>
            </div>
          </div>
        `);

      userMarkersRef.current.push(marker);
    });

    console.log(`BuenosAiresMap: Successfully added ${userMarkersRef.current.length} open to hang user markers`);
  };

  useEffect(() => {
    const initMap = async () => {
      try {
        console.log('BuenosAiresMap: Starting map initialization');
        console.log('BuenosAiresMap: mapRef.current exists:', !!mapRef.current);
        
        if (!mapRef.current) {
          console.log('BuenosAiresMap: mapRef.current is null, exiting');
          return;
        }

        console.log('BuenosAiresMap: Creating map with Leaflet');
        
        // Buenos Aires coordinates
        const buenosAiresCenter: [number, number] = [-34.6118, -58.3960];

        // Create map with optimized settings
        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: false, // Remove attribution for faster loading
          fadeAnimation: false, // Disable fade animation for faster rendering
          zoomAnimation: true,
          markerZoomAnimation: false // Disable marker animations for better performance
        }).setView(buenosAiresCenter, 12);
        
        mapInstanceRef.current = map;
        
        console.log('BuenosAiresMap: Map created successfully');

        // Use faster tile provider with lower quality for faster loading
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 18, // Reduced from 19
          minZoom: 10, // Set minimum zoom for better performance
          tileSize: 256, // Standard tile size for faster loading
          updateWhenZooming: false, // Don't update tiles while zooming for better performance
          updateWhenIdle: true, // Only update when idle
        }).addTo(map);

        // Add marker for Buenos Aires center (reduced popup content)
        L.marker(buenosAiresCenter)
          .addTo(map)
          .bindPopup('Buenos Aires');

        // Add simplified neighborhood markers for faster loading
        const neighborhoods = [
          { name: "Palermo", lat: -34.5870, lng: -58.4263 },
          { name: "Palermo Soho", lat: -34.5906, lng: -58.4203 },
          { name: "Palermo Hollywood", lat: -34.5834, lng: -58.4323 },
          { name: "San Telmo", lat: -34.6202, lng: -58.3731 },
          { name: "Recoleta", lat: -34.5885, lng: -58.3967 },
          { name: "Villa Crespo", lat: -34.5998, lng: -58.4386 },
        ];

        // Add neighborhood markers with simpler popups
        neighborhoods.forEach(neighborhood => {
          L.marker([neighborhood.lat, neighborhood.lng])
            .addTo(map)
            .bindPopup(neighborhood.name);
        });

        // Add user location markers
        addUserLocationMarkers();
        
        // Add event/meetup markers
        addEventMarkers();

        console.log('BuenosAiresMap: Map setup completed successfully');
        setIsLoading(false);
      } catch (err) {
        console.error('BuenosAiresMap: Error loading map:', err);
        setError('שגיאה בטעינת המפה');
        setIsLoading(false);
      }
    };

    // Immediate initialization - no delay for faster loading
    console.log('BuenosAiresMap: Component mounted, initializing map immediately');
    initMap();

    return () => {
      console.log('BuenosAiresMap: Component unmounting, cleaning up');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update user markers when userLocations change
  useEffect(() => {
    console.log('BuenosAiresMap: userLocations changed, length:', userLocations.length);
    if (mapInstanceRef.current && !isLoading) {
      console.log('BuenosAiresMap: Map ready, adding user location markers');
      addUserLocationMarkers();
    } else {
      console.log('BuenosAiresMap: Map not ready yet, isLoading:', isLoading);
    }
  }, [userLocations, isLoading]);

  // Update event markers when events change
  useEffect(() => {
    console.log('BuenosAiresMap: events changed, length:', events.length);
    if (mapInstanceRef.current && !isLoading) {
      console.log('BuenosAiresMap: Map ready, adding event markers');
      addEventMarkers();
    }
  }, [events, isLoading]);

  if (error) {
    return (
      <div className={`${className} bg-muted/30 rounded-xl flex items-center justify-center border border-border/20`}>
        <div className="text-center p-4">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-muted/30 rounded-lg overflow-hidden relative`}>
      {/* Discovery Button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={() => setShowDiscovery(true)}
          size="sm"
          className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg backdrop-blur-sm"
        >
          <Search className="h-4 w-4 mr-2" />
          Discover Who's Around
        </Button>
      </div>

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

      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-[1000] backdrop-blur-sm">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-muted-foreground text-sm">Loading map...</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />

      {/* Discovery Popup */}
      <DiscoveryPopup 
        isOpen={showDiscovery}
        onClose={() => setShowDiscovery(false)}
        onDiscover={handleDiscovery}
      />
    </div>
  );
};

export default BuenosAiresMap;