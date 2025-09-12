import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Users, Calendar, Coffee, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from "@/components/Header";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import BottomNavigation from "@/components/BottomNavigation";
import OpenToHangButton from '@/components/LocationShareButton';
import { useUserLocations } from '@/hooks/useUserLocations';
import { useAuth } from '@/contexts/AuthContext';
import { useOpenToHang } from '@/hooks/useOpenToHang';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const { userLocations } = useUserLocations();
  const { user } = useAuth();
  const { shareHangLocation, stopHanging, checkHangStatus, isLoading: hangLoading, isOpenToHang, setIsOpenToHang } = useOpenToHang();

  // Check if this is the user's first visit to the discover page
  useEffect(() => {
    const hasVisitedDiscover = localStorage.getItem('hasVisitedDiscover');
    if (!hasVisitedDiscover) {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisitedDiscover', 'true');
    }
  }, []);

  // Check user's hang status on load
  useEffect(() => {
    if (user) {
      checkHangStatus();
    }
  }, [user, checkHangStatus]);


  // Function to get neighborhood coordinates
  const getNeighborhoodCoordinates = (locationName: string) => {
    const neighborhoods: Record<string, { lat: number, lng: number }> = {
      "Palermo": { lat: -34.5870, lng: -58.4263 },
      "Palermo Soho": { lat: -34.5906, lng: -58.4203 },
      "Palermo Hollywood": { lat: -34.5834, lng: -58.4323 },
      "San Telmo": { lat: -34.6202, lng: -58.3731 },
      "Recoleta": { lat: -34.5885, lng: -58.3967 },
      "Villa Crespo": { lat: -34.5998, lng: -58.4386 },
      "Buenos Aires": { lat: -34.6118, lng: -58.3960 },
      "Tel Aviv": { lat: -34.6118, lng: -58.3960 }, // Default to Buenos Aires center
    };

    // Find matching neighborhood or default to Buenos Aires center
    const matchedNeighborhood = Object.keys(neighborhoods).find(name => 
      locationName.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(locationName.toLowerCase())
    );

    return neighborhoods[matchedNeighborhood || "Buenos Aires"];
  };

  // Function to handle neighborhood change
  const handleNeighborhoodChange = (neighborhoodName: string) => {
    if (!mapInstanceRef.current) return;

    const coordinates = getNeighborhoodCoordinates(neighborhoodName);
    if (coordinates) {
      mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 15, {
        animate: true,
        duration: 1.5
      });
    }
  };

  // Setup global handler for future functionality if needed
  useEffect(() => {
    // Text pins don't require special click handlers
    // This is kept for future functionality
    return () => {
      // Cleanup if needed
    };
  }, [user]);

  // Function to add user location markers
  const addUserLocationMarkers = (usersToShow = userLocations) => {
    if (!mapInstanceRef.current) return;

    // Filter out Juan and Juani from the user locations
    let displayUsers = usersToShow.filter(userLocation => {
      const profile = userLocation.profile as any;
      const name = profile?.name?.toLowerCase() || '';
      return !name.includes('juan') && !name.includes('juani');
    });

    console.log('Adding user location markers, count:', displayUsers.length, 'isOpenToHang:', isOpenToHang);

    // Clear existing user markers
    if (userMarkersRef.current.length > 0) {
      userMarkersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      userMarkersRef.current = [];
    }

    // Add markers for each user location
    displayUsers.forEach((userLocation) => {
      if (!mapInstanceRef.current) return;

      console.log('Adding marker for user:', userLocation.profile?.name, 'at:', userLocation.latitude, userLocation.longitude);

      const profile = userLocation.profile as any;
      const hasSharedEvents = (userLocation as any).sharedEvents && (userLocation as any).sharedEvents.length > 0;
      const isOpenToHangStatus = (userLocation as any).status === 'open_to_hang';
      const userMood = userLocation.mood;

      // Create custom user icon with mood-based colors
      const getMoodColor = (mood?: string) => {
        switch (mood) {
          case 'chill': return 'border-blue-500';
          case 'go-out': return 'border-orange-500';
          case 'romantic': return 'border-pink-500';
          case 'active': return 'border-green-500';
          case 'creative': return 'border-purple-500';
          case 'wellness': return 'border-green-600';
          case 'music': return 'border-cyan-500';
          default: return 'border-white';
        }
      };

      const getMoodEmoji = (mood?: string) => {
        switch (mood) {
          case 'chill': return '☕';
          case 'go-out': return '⚡';
          case 'romantic': return '💕';
          case 'active': return '💪';
          case 'creative': return '🎨';
          case 'wellness': return '🧘';
          case 'music': return '🎵';
          default: return '😊';
        }
      };

      const borderColor = hasSharedEvents ? 'border-red-500' : getMoodColor(userMood);
      const statusColor = hasSharedEvents ? 'bg-red-500' : isOpenToHangStatus ? 'bg-pink-500' : 'bg-green-500';
      const pulseClass = (hasSharedEvents || isOpenToHangStatus) ? 'animate-pulse' : '';
      
      const userIcon = L.divIcon({
        html: `
          <div class="w-8 h-8 rounded-full border-2 ${borderColor} shadow-lg overflow-hidden bg-white relative ${pulseClass}">
            <img 
              src="${profile?.profile_image_url || '/placeholder.svg'}" 
              alt=""
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusColor} border-2 border-white rounded-full"></div>
            ${hasSharedEvents ? '<div class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white flex items-center justify-center"><span class="text-white text-[8px]">🎯</span></div>' : ''}
            ${isOpenToHangStatus && userMood ? `<div class="absolute top-0 left-0 w-4 h-4 bg-white/90 rounded-full border border-white flex items-center justify-center"><span class="text-[10px]">${getMoodEmoji(userMood)}</span></div>` : ''}
            ${isOpenToHangStatus && !userMood ? '<div class="absolute top-0 left-0 w-2 h-2 bg-pink-500 rounded-full border border-white flex items-center justify-center"><span class="text-white text-[8px]">💕</span></div>' : ''}
          </div>
        `,
        className: `user-location-marker ${hasSharedEvents ? 'highlighted-match' : ''} ${isOpenToHangStatus ? 'open-to-hang' : ''}`,
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
          <div dir="ltr" class="text-left text-sm">
            <div class="flex items-center gap-2">
              <img 
                src="${profile?.profile_image_url || '/placeholder.svg'}" 
                alt=""
                class="w-6 h-6 rounded-full object-cover"
                loading="lazy"
              />
              <span class="font-medium">${profile?.name || 'User'}</span>
            </div>
            ${hasSharedEvents ? `
              <div class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
                🎯 This user is going to the same event as you: ${(userLocation as any).sharedEvents[0]}
              </div>
            ` : ''}
            ${isOpenToHangStatus && userMood ? `
              <div class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                ${getMoodEmoji(userMood)} In a ${userMood} mood
              </div>
            ` : ''}
            ${isOpenToHangStatus && !userMood ? `
              <div class="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full mt-1">
                💕 Open to hang out right now!
              </div>
            ` : ''}
          </div>
        `);

      userMarkersRef.current.push(marker);
    });
  };


  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        const map = L.map(mapContainer.current, {
          center: [-34.6118, -58.3960], // Buenos Aires center
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          boxZoom: false,
          keyboard: true,
        });

        // Add base tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          detectRetina: true,
        }).addTo(map);

        mapInstanceRef.current = map;
        setIsLoading(false);

        // Wait for map to be fully loaded before adding markers
        map.whenReady(() => {
          console.log('Map is ready, adding initial markers');
          addUserLocationMarkers();
        });

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

  // Update markers when user locations or hang status changes
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      console.log('Updating markers based on hang status:', isOpenToHang);
      addUserLocationMarkers();
    }
  }, [userLocations, isOpenToHang]);

  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      addUserLocationMarkers();
    }
  }, [userLocations, isLoading]);


  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Discover"
        onNeighborhoodChange={handleNeighborhoodChange}
      />
      
      <main className={`${user ? 'px-4 py-4 space-y-4' : 'px-4 py-2 space-y-4'} max-w-md mx-auto lg:max-w-none`}>
        
        {/* Map Section - Full Screen */}
        <section className="flex-1">
          {/* Map Container */}
          <div className="relative bg-white rounded-2xl overflow-hidden border border-border shadow-sm h-[calc(100vh-200px)] min-h-[500px] z-10">
            
            {/* Floating Open to Hang Button - On Top of Map */}
            {user && (
              <div className="absolute top-4 left-4 z-20">
                <OpenToHangButton 
                  size="icon" 
                  shareText="Open" 
                  removeText="Stop" 
                  className="w-14 h-14 rounded-full shadow-lg border-2 border-white/20 backdrop-blur-sm text-xs font-bold" 
                />
              </div>
            )}
            
            {/* Non-user message overlay */}
            {!user && (
              <div className="absolute top-4 left-4 right-4 z-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                  <p className="text-sm text-muted-foreground text-center">
                    Find people in the same mood as you to hang out with
                  </p>
                </div>
              </div>
            )}

            {error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-4">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                )}
                <div ref={mapContainer} className="w-full h-full z-0" />
              </>
            )}
          </div>
        </section>


      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default DiscoverPage;
