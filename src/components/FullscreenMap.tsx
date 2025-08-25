import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserLocations } from '@/hooks/useUserLocations';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userLocations } = useUserLocations();

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

    // Add markers for each user location
    userLocations.forEach((userLocation) => {
      if (!mapInstanceRef.current) return;

      // Create custom user icon
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
          <div dir="rtl" class="text-right text-sm">
            <div class="flex items-center gap-2">
              <img 
                src="${userLocation.profile.profile_image_url || '/placeholder.svg'}" 
                alt=""
                class="w-6 h-6 rounded-full object-cover"
                loading="lazy"
              />
              <span class="font-medium">${userLocation.profile.name || 'User'}</span>
            </div>
          </div>
        `);

      userMarkersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        setIsLoading(true);
        
        // Tel Aviv coordinates - center of the city
        const telAvivCenter: [number, number] = [32.0853, 34.7818];

        // Create map with Leaflet
        const map = L.map(mapContainer.current, {
          zoomControl: true,
          attributionControl: true,
          fadeAnimation: true,
          zoomAnimation: true,
        }).setView(telAvivCenter, 13);
        
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 10,
        }).addTo(map);

        // Popular locations in Tel Aviv
        const locations = [
          {
            name: 'Dizengoff Center',
            nameHe: 'דיזינגוף סנטר',
            position: [32.0740, 34.7740] as [number, number],
            color: '#BB31E9',
            type: 'shopping'
          },
          {
            name: 'Carmel Market', 
            nameHe: 'שוק הכרמל',
            position: [32.0663, 34.7692] as [number, number],
            color: '#FF6B6B',
            type: 'market'
          },
          {
            name: 'Tel Aviv Port',
            nameHe: 'נמל תל אביב',
            position: [32.1066, 34.7517] as [number, number],
            color: '#4ECDC4',
            type: 'entertainment'
          },
          {
            name: 'Jaffa Old City',
            nameHe: 'יפו העתיקה',
            position: [32.0545, 34.7520] as [number, number],
            color: '#45B7D1',
            type: 'historic'
          },
          {
            name: 'Rothschild Boulevard',
            nameHe: 'שדרות רוטשילד',
            position: [32.0663, 34.7692] as [number, number],
            color: '#96CEB4',
            type: 'street'
          },
          {
            name: 'Florentin',
            nameHe: 'פלורנטין',
            position: [32.0546, 34.7692] as [number, number],
            color: '#F39C12',
            type: 'neighborhood'
          },
          {
            name: 'Neve Tzedek',
            nameHe: 'נווה צדק',
            position: [32.0587, 34.7683] as [number, number],
            color: '#E74C3C',
            type: 'neighborhood'
          }
        ];

        // Add location markers
        locations.forEach(location => {
          // Create custom marker
          const markerElement = document.createElement('div');
          markerElement.style.cssText = `
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: ${location.color};
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

          L.marker(location.position, { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-center p-2">
                <strong class="text-gray-800 block">${location.nameHe}</strong>
                <span class="text-gray-600 text-sm">${location.name}</span>
              </div>
            `);
        });

        // Add user location markers
        addUserLocationMarkers();

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header with close button */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-foreground">What's Around Me</h2>
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