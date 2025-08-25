import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import LocationShareButton from '@/components/LocationShareButton';
import UniformCard from "@/components/UniformCard";
import AddRecommendationCard from "@/components/AddRecommendationCard";
import SectionHeader from "@/components/SectionHeader";
import { useUserLocations } from '@/hooks/useUserLocations';
import { useRecommendations } from "@/hooks/useRecommendations";
import { useLanguage } from "@/contexts/LanguageContext";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DiscoverPage = () => {
  const { t } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkersRef = useRef<L.Marker[]>([]);
  const recommendationMarkersRef = useRef<L.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userLocations } = useUserLocations();
  const { recommendations, loading: recommendationsLoading } = useRecommendations();

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

  // Function to add recommendation markers
  const addRecommendationMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing recommendation markers
    if (recommendationMarkersRef.current.length > 0) {
      recommendationMarkersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      recommendationMarkersRef.current = [];
    }

    // Add markers for recommendations (mock locations for now)
    recommendations.forEach((recommendation, index) => {
      if (!mapInstanceRef.current) return;

      // Mock coordinates around Buenos Aires neighborhoods
      const mockCoordinates = [
        [-34.5870, -58.4263], // Palermo
        [-34.6202, -58.3731], // San Telmo
        [-34.6343, -58.3635], // La Boca
        [-34.5885, -58.3967], // Recoleta
        [-34.6107, -58.3647], // Puerto Madero
      ];
      
      const coord = mockCoordinates[index % mockCoordinates.length];
      const offsetLat = coord[0] + (Math.random() - 0.5) * 0.01;
      const offsetLng = coord[1] + (Math.random() - 0.5) * 0.01;

      // Create custom recommendation icon
      const recommendationIcon = L.divIcon({
        html: `
          <div class="w-6 h-6 rounded-full bg-primary border-2 border-white shadow-md flex items-center justify-center">
            <span class="text-xs text-white font-bold">🍸</span>
          </div>
        `,
        className: 'recommendation-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
      });

      const marker = L.marker([offsetLat, offsetLng], {
        icon: recommendationIcon,
        riseOnHover: true
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div dir="rtl" class="text-right text-sm p-2">
            <div class="font-medium mb-1">${recommendation.title}</div>
            <div class="text-muted-foreground text-xs">${recommendation.description || 'המלצה מהקהילה'}</div>
            ${recommendation.price ? `<div class="text-primary text-xs mt-1">₪${recommendation.price}</div>` : ''}
          </div>
        `);

      recommendationMarkersRef.current.push(marker);
    });
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
          { name: "San Telmo", lat: -34.6202, lng: -58.3731, color: '#FF6B6B' },
          { name: "La Boca", lat: -34.6343, lng: -58.3635, color: '#4ECDC4' },
          { name: "Recoleta", lat: -34.5885, lng: -58.3967, color: '#45B7D1' },
          { name: "Puerto Madero", lat: -34.6107, lng: -58.3647, color: '#96CEB4' },
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
        addRecommendationMarkers();

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
    if (mapInstanceRef.current && !isLoading && !recommendationsLoading) {
      addRecommendationMarkers();
    }
  }, [recommendations, isLoading, recommendationsLoading]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Discover"
      />
      
      <main className="container mx-auto px-4 py-3 space-y-6">
        {/* Map Section */}
        <div className="relative">
          <div className="flex items-center justify-end mb-4">
            <LocationShareButton size="sm" shareText="Share Location" removeText="Remove Location" />
          </div>
          
          <div className="relative bg-card rounded-xl overflow-hidden shadow-card border h-80">
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

        {/* Recommendations Section */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AddRecommendationCard />
            {!recommendationsLoading && recommendations.map((item) => (
              <UniformCard
                key={item.id}
                id={item.id}
                image={item.image_url}
                title={item.title}
                altText={item.title}
                subtitle={item.description}
                price={item.price?.toString()}
                type="business"
                favoriteData={{
                  id: item.id,
                  title: item.title,
                  image: item.image_url,
                  subtitle: item.description,
                  price: item.price?.toString(),
                  type: 'business'
                }}
              />
            ))}
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default DiscoverPage;