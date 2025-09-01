import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserLocations } from '@/hooks/useUserLocations';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const { userLocations } = useUserLocations();

  console.log('BuenosAiresMap: Component rendered, userLocations:', userLocations.length);

  // Function to filter users based on interests
  const handleDiscovery = (selectedInterests: string[], connectionType: string) => {
    console.log('Discovery filters:', { selectedInterests, connectionType });
    
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

  // Function to add user location markers - optimized for performance
  const addUserLocationMarkers = (usersToShow = userLocations) => {
    if (!mapInstanceRef.current) {
      console.log('BuenosAiresMap: No map instance available for adding markers');
      return;
    }

    console.log(`BuenosAiresMap: Adding markers for ${usersToShow.length} user locations`);

    // Clear existing user markers efficiently
    if (userMarkersRef.current.length > 0) {
      userMarkersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
      userMarkersRef.current = [];
    }

    // Add markers for each user location
    usersToShow.forEach((userLocation, index) => {
      if (!mapInstanceRef.current) return;

      console.log(`BuenosAiresMap: Adding marker ${index + 1} for user:`, userLocation.profile.name, 'at', userLocation.latitude, userLocation.longitude);

      // Create optimized custom icon with smaller HTML for faster rendering
      const userIcon = L.divIcon({
        html: `
          <div class="w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-white relative">
            <img 
              src="${userLocation.profile.profile_image_url || '/placeholder.svg'}" 
              alt=""
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
          </div>
        `,
        className: 'user-location-marker',
        iconSize: [32, 32], // Smaller size for better performance
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
        riseOnHover: true // Better UX without performance cost
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
            </div>
          </div>
        `);

      userMarkersRef.current.push(marker);
    });

    console.log(`BuenosAiresMap: Successfully added ${userMarkersRef.current.length} user markers`);
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