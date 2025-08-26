import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import Header from "@/components/Header";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import BottomNavigation from "@/components/BottomNavigation";
import LocationShareButton from '@/components/LocationShareButton';
import AddRecommendationCard from "@/components/AddRecommendationCard";
import { useUserLocations } from '@/hooks/useUserLocations';
import { useAuth } from '@/contexts/AuthContext';
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
  const { userLocations } = useUserLocations();
  const [userRecommendations, setUserRecommendations] = useState<any[]>([]);

  // Function to add user location markers
  const addUserLocationMarkers = () => {
    if (!mapInstanceRef.current) return;

    console.log('Adding user location markers, count:', userLocations.length);

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

      console.log('Adding marker for user:', userLocation.profile?.name, 'at:', userLocation.latitude, userLocation.longitude);

      // Create custom user icon
      const userIcon = L.divIcon({
        html: `
          <div class="w-10 h-10 rounded-full border-3 border-white shadow-lg overflow-hidden bg-white relative">
            <img 
              src="${userLocation.profile?.profile_image_url || '/placeholder.svg'}" 
              alt=""
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        `,
        className: 'user-location-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
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
                src="${userLocation.profile?.profile_image_url || '/placeholder.svg'}" 
                alt=""
                class="w-6 h-6 rounded-full object-cover"
                loading="lazy"
              />
              <span class="font-medium">${userLocation.profile?.name || 'User'}</span>
            </div>
            <div class="text-xs text-muted-foreground mt-1">📍 Current location</div>
          </div>
        `);

      userMarkersRef.current.push(marker);
    });
  };

  // Function to add recommendation markers
  const addRecommendationMarkers = async () => {
    if (!mapInstanceRef.current) return;

    // Clear existing recommendation markers
    if (recommendationMarkersRef.current.length > 0) {
      recommendationMarkersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      recommendationMarkersRef.current = [];
    }

    // Fetch recommendations from database
    try {
      const { data: recommendations, error } = await supabase
        .from('items')
        .select('*')
        .eq('category', 'recommendation')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching recommendations:', error);
        return;
      }

      // Fetch user profiles for recommendations
      const userIds = recommendations?.map(r => r.user_id).filter(Boolean) || [];
      let profiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, profile_image_url')
          .in('id', userIds);
        profiles = profilesData || [];
      }

      // Combine recommendations with profiles
      const recommendationsWithProfiles = recommendations?.map(recommendation => ({
        ...recommendation,
        profile: profiles.find(p => p.id === recommendation.user_id)
      })) || [];

      setUserRecommendations(recommendationsWithProfiles);

      // Add markers for recommendations
      recommendationsWithProfiles.forEach((recommendation) => {
        if (!mapInstanceRef.current) return;

        let lat, lng;
        try {
          if (recommendation.location) {
            const locationData = JSON.parse(recommendation.location);
            lat = locationData.lat;
            lng = locationData.lng;
          }
        } catch (error) {
          console.error('Error parsing location data:', error);
          return;
        }

        if (!lat || !lng) return;

        // Create custom recommendation icon
        const recommendationIcon = L.divIcon({
          html: `
            <div class="w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-md flex items-center justify-center relative">
              <span class="text-sm">📍</span>
              <div class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-400 border border-white rounded-full flex items-center justify-center">
                <span class="text-xs">⭐</span>
              </div>
            </div>
          `,
          className: 'recommendation-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const marker = L.marker([lat, lng], {
          icon: recommendationIcon,
          riseOnHover: true
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div dir="ltr" class="text-left text-sm p-3 max-w-64">
              ${recommendation.image_url ? `
                <div class="mb-3">
                  <img 
                    src="${recommendation.image_url}" 
                    alt="${recommendation.title}"
                    class="w-full h-32 object-cover rounded-lg shadow-sm"
                    loading="lazy"
                  />
                </div>
              ` : ''}
              <div class="font-semibold text-base mb-2 text-gray-800">${recommendation.title}</div>
              ${recommendation.description ? `<div class="text-gray-600 text-sm mb-3 leading-relaxed">${recommendation.description}</div>` : ''}
              ${recommendation.profile ? `
                <div class="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <img 
                    src="${recommendation.profile.profile_image_url || '/placeholder.svg'}" 
                    alt=""
                    class="w-4 h-4 rounded-full object-cover"
                  />
                  <span>Recommended by ${recommendation.profile.name || 'User'}</span>
                </div>
              ` : ''}
              ${recommendation.instagram_url ? `
                <a href="${recommendation.instagram_url}" target="_blank" class="inline-flex items-center gap-1 text-orange-600 text-sm hover:underline font-medium">
                  🔗 Visit Link
                </a>
              ` : ''}
            </div>
          `);

        recommendationMarkersRef.current.push(marker);
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
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
    if (mapInstanceRef.current && !isLoading) {
      addRecommendationMarkers();
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Discover"
      />
      
      {/* Neighborhood Selector */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="container mx-auto flex justify-center">
          <NeighborhoodSelector />
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-3 space-y-6">
        {/* Map Section */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recommendations</h3>
            <LocationShareButton size="sm" shareText="Share Location" removeText="Remove Location" />
          </div>
          
          <div className="relative bg-card rounded-xl overflow-hidden shadow-card border h-96">
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
        <div className="space-y-4">
          <div className="flex">
            <AddRecommendationCard onRecommendationAdded={addRecommendationMarkers} className="w-80" />
          </div>
          
          {/* Display Recommendations */}
          {userRecommendations.length > 0 && (
            <div className="grid gap-3">
              {userRecommendations.map((recommendation) => (
                <div 
                  key={recommendation.id}
                  className="bg-card rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3">
                    {recommendation.image_url && (
                      <img 
                        src={recommendation.image_url} 
                        alt={recommendation.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground mb-1">{recommendation.title}</h4>
                      {recommendation.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {recommendation.description}
                        </p>
                      )}
                      {recommendation.profile && (
                        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                          <img 
                            src={recommendation.profile.profile_image_url || '/placeholder.svg'} 
                            alt=""
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span>Recommended by {recommendation.profile.name || 'User'}</span>
                        </div>
                      )}
                      {recommendation.instagram_url && (
                        <a 
                          href={recommendation.instagram_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          🔗 Link
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default DiscoverPage;