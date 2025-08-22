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
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;

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