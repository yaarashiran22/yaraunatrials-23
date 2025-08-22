import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface BuenosAiresMapProps {
  className?: string;
}

const BuenosAiresMap = ({ className = "w-full h-64" }: BuenosAiresMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: "AIzaSyBxDVr8E5kHZJ_CfKoEFEKyVr5pS9kFqjQ", // Public Google Maps API key
          version: "weekly",
          libraries: ["places", "geometry"]
        });

        const { Map } = await loader.importLibrary("maps");
        const { AdvancedMarkerElement } = await loader.importLibrary("marker");

        if (!mapRef.current) return;

        // Buenos Aires coordinates
        const buenosAiresCenter = { lat: -34.6118, lng: -58.3960 };

        const map = new Map(mapRef.current, {
          zoom: 12,
          center: buenosAiresCenter,
          mapId: "BUENOS_AIRES_MAP",
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Add marker for Buenos Aires center
        new AdvancedMarkerElement({
          map,
          position: buenosAiresCenter,
          title: "Buenos Aires",
        });

        // Add some popular neighborhoods as markers
        const neighborhoods = [
          { name: "Palermo", lat: -34.5870, lng: -58.4263 },
          { name: "San Telmo", lat: -34.6202, lng: -58.3731 },
          { name: "La Boca", lat: -34.6343, lng: -58.3635 },
          { name: "Recoleta", lat: -34.5885, lng: -58.3967 },
          { name: "Puerto Madero", lat: -34.6107, lng: -58.3647 },
        ];

        neighborhoods.forEach(neighborhood => {
          new AdvancedMarkerElement({
            map,
            position: { lat: neighborhood.lat, lng: neighborhood.lng },
            title: neighborhood.name,
          });
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('שגיאה בטעינת המפה');
        setIsLoading(false);
      }
    };

    initMap();
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
        <div className="absolute inset-0 bg-muted/30 flex items-center justify-center z-10">
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