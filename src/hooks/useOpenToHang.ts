import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useOpenToHang = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenToHang, setIsOpenToHang] = useState(false);

  const stopHanging = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_locations')
        .update({
          status: 'normal',
          status_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsOpenToHang(false);
      toast({
        title: "Status updated",
        description: "You're no longer marked as open to hang",
      });

      return true;
    } catch (error) {
      console.error('Error stopping hang status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
      return false;
    }
  };

  // Check user's current hang status on load
  const checkHangStatus = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('status, status_expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.status === 'open_to_hang' && data?.status_expires_at) {
        const expiryTime = new Date(data.status_expires_at);
        const now = new Date();
        
        if (expiryTime > now) {
          setIsOpenToHang(true);
          // Set timeout for remaining time
          const timeLeft = expiryTime.getTime() - now.getTime();
          setTimeout(() => {
            setIsOpenToHang(false);
          }, timeLeft);
        } else {
          // Status expired, update in database silently
          await supabase
            .from('user_locations')
            .update({
              status: 'normal',
              status_expires_at: null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
          setIsOpenToHang(false);
        }
      } else {
        setIsOpenToHang(false);
      }
    } catch (error) {
      console.error('Error checking hang status:', error);
    }
  }, [user]);

  const shareHangLocation = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to share your location",
        variant: "destructive",
      });
      return false;
    }

    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location sharing",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Set expiration time to 2 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      // Update or insert user location with "open to hang" status
      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          latitude: latitude,
          longitude: longitude,
          status: 'open_to_hang',
          status_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setIsOpenToHang(true);
      
      toast({
        title: "You're open to hang! 🎉",
        description: "Your location is now visible to others for 2 hours",
      });

      // Auto-expire after 2 hours
      setTimeout(() => {
        setIsOpenToHang(false);
      }, 2 * 60 * 60 * 1000);

      return true;
    } catch (error: any) {
      console.error('Error sharing hang location:', error);
      
      if (error.code === 1) { // PERMISSION_DENIED
        toast({
          title: "Location permission denied",
          description: "Please allow location access to share where you want to hang",
          variant: "destructive",
        });
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        toast({
          title: "Location unavailable",
          description: "Could not determine your location. Please try again",
          variant: "destructive",
        });
      } else if (error.code === 3) { // TIMEOUT
        toast({
          title: "Location timeout",
          description: "Location request timed out. Please try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to share location. Please try again",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    shareHangLocation,
    stopHanging,
    checkHangStatus,
    isLoading,
    isOpenToHang,
    setIsOpenToHang
  };
};