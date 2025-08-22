import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, X, AlertCircle } from 'lucide-react';
import { useUserLocations } from '@/hooks/useUserLocations';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LocationShareButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const LocationShareButton = ({ 
  variant = 'outline', 
  size = 'default',
  className = ''
}: LocationShareButtonProps) => {
  const { user } = useAuth();
  const { userLocations, sharing, shareLocation, removeLocation } = useUserLocations();
  const [isRemoving, setIsRemoving] = useState(false);
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Check geolocation permission status
  useEffect(() => {
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          setPermissionState(permission.state);
          
          permission.addEventListener('change', () => {
            setPermissionState(permission.state);
          });
        } catch (error) {
          console.log('Permission API not supported');
        }
      }
    };
    
    checkPermission();
  }, []);

  // Check if current user has shared their location
  const userHasSharedLocation = userLocations.some(loc => loc.user_id === user?.id);

  const handleLocationShare = async () => {
    if (!user) {
      toast.error('יש להתחבר כדי לשתף מיקום');
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast.error('הדפדפן שלך לא תומך במיקום');
      return;
    }

    // Show helpful message if permission was denied
    if (permissionState === 'denied') {
      toast.error('גישה למיקום נדחתה. אנא אפשר גישה למיקום בהגדרות הדפדפן ורענן את הדף.');
      return;
    }

    console.log('Starting location share process...');
    toast.loading('מבקש הרשאה למיקום...');

    const result = await shareLocation();
    
    if (result.success) {
      toast.success('המיקום שותף בהצלחה!');
      console.log('Location shared successfully');
    } else {
      console.error('Location sharing failed:', result.error);
      toast.error(result.error || 'שגיאה בשיתוף המיקום');
      
      // Show additional help for common issues
      if (result.error?.includes('denied')) {
        toast.info('טיפ: בדוק שאפשרת גישה למיקום בדפדפן שלך', {
          duration: 5000
        });
      }
    }
  };

  const handleRemoveLocation = async () => {
    if (!user) return;

    setIsRemoving(true);
    const result = await removeLocation();
    
    if (result.success) {
      toast.success('המיקום הוסר בהצלחה');
    } else {
      toast.error(result.error || 'שגיאה בהסרת המיקום');
    }
    setIsRemoving(false);
  };

  if (userHasSharedLocation) {
    return (
      <Button
        onClick={handleRemoveLocation}
        disabled={isRemoving}
        variant="outline"
        size={size}
        className={`${className} text-destructive border-destructive/20 hover:bg-destructive/5 hover:border-destructive/30`}
      >
        {isRemoving ? (
          <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin ml-2" />
        ) : (
          <X className="w-4 h-4 ml-2" />
        )}
        הסר מיקום
      </Button>
    );
  }

  return (
    <Button
      onClick={handleLocationShare}
      disabled={sharing || permissionState === 'denied'}
      variant={variant}
      size={size}
      className={`${className} ${permissionState === 'denied' ? 'opacity-50' : ''}`}
      title={permissionState === 'denied' ? 'גישה למיקום נדחתה - אנא אפשר גישה בהגדרות הדפדפן' : ''}
    >
      {sharing ? (
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-2" />
      ) : permissionState === 'denied' ? (
        <AlertCircle className="w-4 h-4 ml-2" />
      ) : (
        <MapPin className="w-4 h-4 ml-2" />
      )}
      {permissionState === 'denied' ? 'גישה נדחתה' : 'שתף מיקום'}
    </Button>
  );
};

export default LocationShareButton;