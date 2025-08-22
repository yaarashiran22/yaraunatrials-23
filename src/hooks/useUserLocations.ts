import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserLocation {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  name: string;
  profile_image_url: string;
}

interface UserLocationWithProfile extends UserLocation {
  profile: UserProfile;
}

export const useUserLocations = () => {
  const { user } = useAuth();
  const [userLocations, setUserLocations] = useState<UserLocationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  // Progressive location detection with fallback
  const getLocationWithFallback = async (): Promise<GeolocationPosition> => {
    console.log('Starting location detection with fallback methods...');
    
    // Method 1: Try quick, less accurate location first
    try {
      console.log('Trying method 1: Quick location (network-based)...');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Quick location timeout'));
        }, 5000); // Short timeout for quick method
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            console.log('Method 1 succeeded:', position.coords);
            resolve(position);
          },
          (error) => {
            clearTimeout(timeoutId);
            console.log('Method 1 failed:', error.message);
            reject(error);
          },
          {
            enableHighAccuracy: false, // Network/WiFi based location
            timeout: 4000,
            maximumAge: 600000 // 10 minutes cache
          }
        );
      });
      return position;
    } catch (error) {
      console.log('Method 1 failed, trying method 2...');
    }

    // Method 2: Try with GPS but longer timeout
    try {
      console.log('Trying method 2: GPS with longer timeout...');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('GPS location timeout'));
        }, 20000); // Longer timeout for GPS
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            console.log('Method 2 succeeded:', position.coords);
            resolve(position);
          },
          (error) => {
            clearTimeout(timeoutId);
            console.log('Method 2 failed:', error.message);
            reject(error);
          },
          {
            enableHighAccuracy: true, // GPS based location
            timeout: 18000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      });
      return position;
    } catch (error) {
      console.log('Method 2 failed, trying method 3...');
    }

    // Method 3: Fallback with very relaxed settings
    try {
      console.log('Trying method 3: Fallback with relaxed settings...');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('All location methods failed'));
        }, 30000); // Very long timeout
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            console.log('Method 3 succeeded:', position.coords);
            resolve(position);
          },
          (error) => {
            clearTimeout(timeoutId);
            console.log('Method 3 failed:', error.message);
            
            let errorMessage = 'לא ניתן לקבל מיקום';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'הגישה למיקום נדחתה. אנא אפשר גישה למיקום בהגדרות הדפדפן.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'המיקום לא זמין. בדוק שהמיקום מופעל במכשיר.';
                break;
              case error.TIMEOUT:
                errorMessage = 'זמן קבלת המיקום פג. נסה שוב במקום עם קליטה טובה יותר.';
                break;
              default:
                errorMessage = `שגיאת מיקום: ${error.message}`;
                break;
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: false,
            timeout: 25000,
            maximumAge: 900000 // 15 minutes cache - very permissive
          }
        );
      });
      return position;
    } catch (error) {
      // If all methods fail, provide helpful error
      throw new Error('לא ניתן לקבל מיקום. נסה לרענן את הדף או לבדוק שהמיקום מופעל במכשיר.');
    }
  };

  // Fetch all user locations with profiles
  const fetchUserLocations = async () => {
    try {
      const { data: locations, error: locationsError } = await supabase
        .from('user_locations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (locationsError) {
        console.error('Error fetching user locations:', locationsError);
        return;
      }

      if (!locations || locations.length === 0) {
        setUserLocations([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(locations.map(loc => loc.user_id))];

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, profile_image_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Combine locations with profiles
      const locationsWithProfiles = locations
        .map(location => {
          const profile = profiles?.find(p => p.id === location.user_id);
          if (profile) {
            return {
              ...location,
              profile
            };
          }
          return null;
        })
        .filter(Boolean) as UserLocationWithProfile[];

      setUserLocations(locationsWithProfiles);
    } catch (error) {
      console.error('Error in fetchUserLocations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Share current location
  const shareLocation = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!navigator.geolocation) {
      return { success: false, error: 'Geolocation is not supported by this browser' };
    }

    setSharing(true);

    try {
      console.log('Requesting location permission...');
      
      // Try to get location with progressive fallback
      const position = await getLocationWithFallback();
      
      const { latitude, longitude } = position.coords;
      console.log('Using coordinates:', latitude, longitude);

      // Check if user already has a location shared
      const { data: existingLocation } = await supabase
        .from('user_locations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existingLocation) {
        // Update existing location
        result = await supabase
          .from('user_locations')
          .update({
            latitude: latitude,
            longitude: longitude,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Create new location
        result = await supabase
          .from('user_locations')
          .insert({
            user_id: user.id,
            latitude: latitude,
            longitude: longitude
          });
      }

      if (result.error) {
        console.error('Error saving location:', result.error);
        return { success: false, error: 'Failed to save location' };
      }

      // Refresh locations
      await fetchUserLocations();

      return { success: true };
    } catch (error) {
      console.error('Error getting location:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get location' 
      };
    } finally {
      setSharing(false);
    }
  };

  // Remove user's location
  const removeLocation = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('user_locations')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing location:', error);
        return { success: false, error: 'Failed to remove location' };
      }

      // Refresh locations
      await fetchUserLocations();

      return { success: true };
    } catch (error) {
      console.error('Error removing location:', error);
      return { success: false, error: 'Failed to remove location' };
    }
  };

  useEffect(() => {
    fetchUserLocations();
  }, []);

  return {
    userLocations,
    loading,
    sharing,
    shareLocation,
    removeLocation,
    refreshLocations: fetchUserLocations
  };
};