import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Create map
        const map = L.map(mapRef.current).setView(buenosAiresCenter, 12);
        mapInstanceRef.current = map;
        
        console.log('BuenosAiresMap: Map created successfully');

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add marker for Buenos Aires center
        L.marker(buenosAiresCenter)
          .addTo(map)
          .bindPopup('Buenos Aires<br>בואנוס איירס')
          .openPopup();

        // Add some popular neighborhoods as markers
        const neighborhoods = [
          { name: "Palermo", nameHe: "פלרמו", lat: -34.5870, lng: -58.4263 },
          { name: "San Telmo", nameHe: "סן טלמו", lat: -34.6202, lng: -58.3731 },
          { name: "La Boca", nameHe: "לה בוקה", lat: -34.6343, lng: -58.3635 },
          { name: "Recoleta", nameHe: "רקולטה", lat: -34.5885, lng: -58.3967 },
          { name: "Puerto Madero", nameHe: "פוארטו מדרו", lat: -34.6107, lng: -58.3647 },
        ];

        neighborhoods.forEach(neighborhood => {
          L.marker([neighborhood.lat, neighborhood.lng])
            .addTo(map)
            .bindPopup(`${neighborhood.name}<br>${neighborhood.nameHe}`);
        });

        console.log('BuenosAiresMap: Map setup completed successfully');
        setIsLoading(false);
      } catch (err) {
        console.error('BuenosAiresMap: Error loading map:', err);
        setError('שגיאה בטעינת המפה');
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    console.log('BuenosAiresMap: Component mounted, setting up timer');
    const timer = setTimeout(() => {
      console.log('BuenosAiresMap: Timer fired, calling initMap');
      initMap();
    }, 100);

    return () => {
      console.log('BuenosAiresMap: Component unmounting, cleaning up');
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

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
    <div className={`${className} rounded-xl overflow-hidden border border-border/20 shadow-sm relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted/30 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-muted-foreground text-sm">טוען מפה...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default BuenosAiresMap;