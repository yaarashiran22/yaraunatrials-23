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
import { useRecommendationAgreements } from '@/hooks/useRecommendationAgreements';

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
  const { user } = useAuth();
  const [userRecommendations, setUserRecommendations] = useState<any[]>([]);
  const [popularRecommendations, setPopularRecommendations] = useState<any[]>([]);

  // Setup global handler for agree clicks in map popups
  useEffect(() => {
    (window as any).handleAgreeClick = async (recommendationId: string) => {
      if (!user) {
        alert('Please log in to agree with recommendations');
        return;
      }

      try {
        // Check if user already agreed
        const { data: existingAgreement } = await supabase
          .from('recommendation_agreements')
          .select('id')
          .eq('recommendation_id', recommendationId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingAgreement) {
          // Remove agreement
          await supabase
            .from('recommendation_agreements')
            .delete()
            .eq('recommendation_id', recommendationId)
            .eq('user_id', user.id);
        } else {
          // Add agreement
          await supabase
            .from('recommendation_agreements')
            .insert({
              recommendation_id: recommendationId,
              user_id: user.id
            });
        }

        // Update the count in the popup
        const { count } = await supabase
          .from('recommendation_agreements')
          .select('*', { count: 'exact', head: true })
          .eq('recommendation_id', recommendationId);

        const countElement = document.getElementById(`agree-count-${recommendationId}`);
        if (countElement) {
          countElement.textContent = `${count || 0} agrees`;
        }

        // Update button text
        const buttonElements = document.querySelectorAll(`[onclick="handleAgreeClick('${recommendationId}')"]`);
        buttonElements.forEach(button => {
          button.textContent = existingAgreement ? '👍 Agree' : '✓ Agreed';
        });

      } catch (error) {
        console.error('Error handling agreement:', error);
        alert('Error updating agreement');
      }
    };

    return () => {
      delete (window as any).handleAgreeClick;
    };
  }, [user]);

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

      // Fetch popular recommendations (with most agrees)
      const recommendationCounts = new Map<string, number>();
      
      // Get all agreements and count them manually
      const { data: allAgreements } = await supabase
        .from('recommendation_agreements')
        .select('recommendation_id');

      if (allAgreements) {
        allAgreements.forEach(agreement => {
          const count = recommendationCounts.get(agreement.recommendation_id) || 0;
          recommendationCounts.set(agreement.recommendation_id, count + 1);
        });
      }

      // Sort recommendations by agreement count and take top 5
      const popularRecs = recommendationsWithProfiles
        .map(rec => ({
          ...rec,
          agreementCount: recommendationCounts.get(rec.id) || 0
        }))
        .filter(rec => rec.agreementCount > 0)
        .sort((a, b) => b.agreementCount - a.agreementCount)
        .slice(0, 5);

      setPopularRecommendations(popularRecs);

      // Add markers for recommendations
      for (const recommendation of recommendationsWithProfiles) {
        if (!mapInstanceRef.current) continue;

        let lat, lng;
        try {
          if (recommendation.location) {
            const locationData = JSON.parse(recommendation.location);
            lat = locationData.lat;
            lng = locationData.lng;
          }
        } catch (error) {
          console.error('Error parsing location data:', error);
          continue;
        }

        if (!lat || !lng) continue;

        // Get current agreement count for this recommendation
        const { count: agreementCount } = await supabase
          .from('recommendation_agreements')
          .select('*', { count: 'exact', head: true })
          .eq('recommendation_id', recommendation.id);

        // Check if current user has agreed
        let userHasAgreed = false;
        if (user) {
          const { data: userAgreement } = await supabase
            .from('recommendation_agreements')
            .select('id')
            .eq('recommendation_id', recommendation.id)
            .eq('user_id', user.id)
            .maybeSingle();
          userHasAgreed = !!userAgreement;
        }

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
            <div dir="ltr" class="recommendation-popup">
              <style>
                .recommendation-popup {
                  text-left: left;
                  width: 200px;
                  max-width: 200px;
                  font-family: system-ui, -apple-system, sans-serif;
                  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                  border-radius: 16px;
                  padding: 0;
                  margin: 0;
                  box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5);
                  backdrop-filter: blur(10px);
                  overflow: hidden;
                }
                .recommendation-popup .popup-image {
                  width: 100%;
                  height: 120px;
                  object-fit: cover;
                  border-radius: 12px 12px 0 0;
                  margin-bottom: 12px;
                }
                .recommendation-popup .popup-content {
                  padding: 16px;
                  padding-top: 0;
                }
                .recommendation-popup .popup-title {
                  font-weight: 600;
                  font-size: 16px;
                  margin-bottom: 8px;
                  color: #1a202c;
                  line-height: 1.3;
                }
                .recommendation-popup .popup-description {
                  color: #4a5568;
                  font-size: 13px;
                  margin-bottom: 12px;
                  line-height: 1.4;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                }
                .recommendation-popup .popup-author {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  margin-bottom: 12px;
                  font-size: 11px;
                  color: #718096;
                }
                .recommendation-popup .popup-author img {
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  object-fit: cover;
                }
                .recommendation-popup .popup-link {
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                  color: #3182ce;
                  font-size: 12px;
                  font-weight: 500;
                  text-decoration: none;
                  margin-bottom: 12px;
                  transition: color 0.2s;
                }
                .recommendation-popup .popup-link:hover {
                  color: #2c5aa0;
                }
                .recommendation-popup .agree-section {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 8px 12px;
                  background: rgba(59, 130, 246, 0.05);
                  border-radius: 8px;
                  border: 1px solid rgba(59, 130, 246, 0.1);
                }
                .recommendation-popup .agree-button {
                  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                  color: white;
                  border: none;
                  padding: 6px 12px;
                  border-radius: 6px;
                  font-size: 11px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s;
                  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
                }
                .recommendation-popup .agree-button:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
                }
                .recommendation-popup .agree-count {
                  font-size: 11px;
                  color: #4a5568;
                  font-weight: 500;
                }
              </style>
              <div class="popup-content">
                ${recommendation.image_url ? `
                  <img 
                    src="${recommendation.image_url}" 
                    alt="${recommendation.title}"
                    class="popup-image"
                    loading="lazy"
                  />
                ` : ''}
                <div class="popup-title">${recommendation.title}</div>
                ${recommendation.description ? `<div class="popup-description">${recommendation.description}</div>` : ''}
                ${recommendation.profile ? `
                  <div class="popup-author">
                    <img 
                      src="${recommendation.profile.profile_image_url || '/placeholder.svg'}" 
                      alt=""
                    />
                    <span>By ${recommendation.profile.name || 'User'}</span>
                  </div>
                ` : ''}
                ${recommendation.instagram_url ? `
                  <a href="${recommendation.instagram_url}" target="_blank" class="popup-link">
                    🔗 Visit Link
                  </a>
                ` : ''}
                <div class="agree-section">
                  <span class="agree-count" id="agree-count-${recommendation.id}">${agreementCount || 0} agrees</span>
                  <button class="agree-button" onclick="handleAgreeClick('${recommendation.id}')">
                    ${userHasAgreed ? '✓ Agreed' : '👍 Agree'}
                  </button>
                </div>
              </div>
            </div>
          `, { maxWidth: 220, className: 'custom-popup' });

        recommendationMarkersRef.current.push(marker);
      }
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
      
      
      <main className="container mx-auto px-4 py-3 space-y-6">
        {/* Map Section */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <AddRecommendationCard onRecommendationAdded={addRecommendationMarkers} className="w-32" />
            <LocationShareButton size="sm" shareText="Share Location" removeText="Remove Location" className="w-32" />
          </div>
          
          <div className="relative bg-card rounded-xl overflow-hidden shadow-card border h-96 z-0">
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
        </div>

        {/* Most Popular in the Neighborhood */}
        {popularRecommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              🔥 Most Popular in the Neighborhood
            </h3>
            <div className="grid gap-3">
              {popularRecommendations.map((recommendation) => (
                <div 
                  key={recommendation.id}
                  className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-lg p-4 shadow-sm border border-orange-200 dark:border-orange-800 hover:shadow-md transition-all"
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
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-foreground">{recommendation.title}</h4>
                        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-sm font-medium">
                          <span>👍</span>
                          <span>{recommendation.agreementCount || 0}</span>
                        </div>
                      </div>
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
                          🔗 Visit Link
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        <div className="space-y-4">
          
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