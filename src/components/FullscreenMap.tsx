import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserLocations } from '@/hooks/useUserLocations';
import { useEvents } from '@/hooks/useEvents';
import LocationShareButton from '@/components/LocationShareButton';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface FullscreenMapProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullscreenMap = ({ isOpen, onClose }: FullscreenMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkersRef = useRef<L.Marker[]>([]);
  const eventMarkersRef = useRef<L.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userLocations } = useUserLocations();
  const { events } = useEvents();

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
          <div class="w-12 h-12 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-xl font-bold" 
               style="background-color: ${iconColor}; color: white;">
            ${iconText}
          </div>
        `,
        className: 'event-marker',
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48]
      });

      const marker = L.marker(coords, {
        icon: eventIcon,
        riseOnHover: true
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="text-center p-3 max-w-sm">
            <h3 class="font-bold text-lg mb-2">${event.title}</h3>
            <p class="text-sm text-gray-600 mb-3">${event.description || ''}</p>
            <div class="text-sm space-y-1">
              <div><strong>Date:</strong> ${event.date || 'TBD'}</div>
              <div><strong>Time:</strong> ${event.time || 'TBD'}</div>
              <div><strong>Location:</strong> ${event.location || 'TBD'}</div>
              <div><strong>Price:</strong> ${event.price || 'Free'}</div>
            </div>
            <div class="mt-3 text-sm bg-gray-100 rounded px-3 py-2">
              <strong>${isEvent ? 'Event' : 'Meetup'}</strong> by ${event.uploader?.name}
            </div>
          </div>
        `);

      eventMarkersRef.current.push(marker);
    });

    console.log(`Added ${eventMarkersRef.current.length} event markers to fullscreen map`);
  };

  // Function to add user location markers
  const addUserLocationMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing user markers
    if (userMarkersRef.current.length > 0) {
      userMarkersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      userMarkersRef.current = [];
    }

    // Spread overlapping user markers
    const spreadUsers = spreadOverlappingMarkers(
      userLocations,
      (user) => [user.latitude, user.longitude]
    );

    // Add markers for each user location (open to hang users)
    spreadUsers.forEach(({item: userLocation, coords}) => {
      if (!mapInstanceRef.current) return;

      // Create custom user icon with pulsing effect for "open to hang" users
      const userIcon = L.divIcon({
        html: `
          <div class="relative">
            <div class="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-white relative animate-pulse">
              <img 
                src="${userLocation.profile.profile_image_url || '/placeholder.svg'}" 
                alt=""
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-pink-500 border-2 border-white rounded-full animate-ping"></div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-pink-500 border-2 border-white rounded-full"></div>
          </div>
        `,
        className: 'user-location-marker open-to-hang',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      const marker = L.marker(coords, {
        icon: userIcon,
        riseOnHover: true
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div dir="rtl" class="text-right text-base p-2">
            <div class="flex items-center gap-2 mb-2">
              <img 
                src="${userLocation.profile.profile_image_url || '/placeholder.svg'}" 
                alt=""
                class="w-8 h-8 rounded-full object-cover"
                loading="lazy"
              />
              <span class="font-medium text-lg">${userLocation.profile.name || 'User'}</span>
            </div>
            <div class="bg-pink-500 text-white text-sm px-3 py-1 rounded-full text-center">
              💫 Open to Hang! 💫
            </div>
          </div>
        `);

      userMarkersRef.current.push(marker);
    });

    console.log(`Added ${userMarkersRef.current.length} open to hang user markers to fullscreen map`);
  };

  useEffect(() => {

    if (!isOpen) return;

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

        // Add user location markers
        addUserLocationMarkers();
        
        // Add event/meetup markers
        addEventMarkers();

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
  }, [isOpen]);

  // Update user markers when userLocations change
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      addUserLocationMarkers();
    }
  }, [userLocations, isLoading]);

  // Update event markers when events change
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      addEventMarkers();
    }
  }, [events, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 bottom-20 left-0 right-0 z-40 bg-background">
      {/* Header with close button */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-foreground">What's Around Me</h2>
          <div className="flex items-center gap-2">
            <LocationShareButton size="sm" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="w-full h-full pt-16">
        {error ? (
          <div className="flex items-center justify-center h-full bg-muted/30">
            <div className="text-center p-4">
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-[1000] backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-muted-foreground text-sm">Loading map...</p>
                </div>
              </div>
            )}
            <div ref={mapContainer} className="w-full h-full" />
          </>
        )}
      </div>
    </div>
  );
};

export default FullscreenMap;