import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullscreenMapProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullscreenMap = ({ isOpen, onClose }: FullscreenMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Get Google Maps API key from Supabase secrets
        const { data: { GOOGLE_MAPS_API_KEY }, error } = await supabase.functions.invoke('get-secret', {
          body: { name: 'GOOGLE_MAPS_API_KEY' }
        });

        if (error || !GOOGLE_MAPS_API_KEY) {
          console.error('Failed to get Google Maps API key:', error);
          mapContainer.current.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
              <p class="text-gray-500 text-center">נדרש מפתח Google Maps API</p>
            </div>
          `;
          return;
        }

        // Initialize Google Maps
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places']
        });

        const { Map } = await loader.importLibrary('maps') as any;
        const { AdvancedMarkerElement } = await loader.importLibrary('marker') as any;

        // Tel Aviv coordinates
        const telAvivCenter = { lat: 32.0853, lng: 34.7818 };

        // Create map
        mapRef.current = new Map(mapContainer.current, {
          zoom: 12,
          center: telAvivCenter,
          mapId: 'tel-aviv-fullscreen-map',
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Popular locations in Tel Aviv
        const locations = [
          {
            name: 'דיזינגוף סנטר',
            position: { lat: 32.0740, lng: 34.7740 },
            color: '#BB31E9'
          },
          {
            name: 'שוק הכרמל',
            position: { lat: 32.0663, lng: 34.7692 },
            color: '#FF6B6B'
          },
          {
            name: 'נמל תל אביב',
            position: { lat: 32.1066, lng: 34.7517 },
            color: '#4ECDC4'
          },
          {
            name: 'יפו העתיקה',
            position: { lat: 32.0545, lng: 34.7520 },
            color: '#45B7D1'
          },
          {
            name: 'שדרות רוטשילד',
            position: { lat: 32.0663, lng: 34.7692 },
            color: '#96CEB4'
          }
        ];

        // Add markers
        locations.forEach(location => {
          // Create custom marker element
          const markerElement = document.createElement('div');
          markerElement.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: ${location.color};
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          `;

          // Create info window
          const infoWindow = new (window as any).google.maps.InfoWindow({
            content: `
              <div style="text-align: center; font-family: 'Inter', sans-serif; padding: 8px;">
                <strong style="color: #333; font-size: 14px;">${location.name}</strong>
              </div>
            `
          });

          // Create advanced marker
          const marker = new AdvancedMarkerElement({
            map: mapRef.current,
            position: location.position,
            content: markerElement,
            title: location.name,
          });

          // Add click listener
          marker.addListener('click', () => {
            infoWindow.open(mapRef.current, marker);
          });
        });

      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        if (mapContainer.current) {
          mapContainer.current.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
              <p class="text-gray-500 text-center">שגיאה בטעינת המפה</p>
            </div>
          `;
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      mapRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header with close button */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-foreground">מפת תל אביב</h2>
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
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
};

export default FullscreenMap;