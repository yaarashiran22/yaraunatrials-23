import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, X, AlertCircle, Heart } from 'lucide-react';
import { useOpenToHang } from '@/hooks/useOpenToHang';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import MoodSelectionDialog from './MoodSelectionDialog';

interface OpenToHangButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  shareText?: string;
  removeText?: string;
}

const OpenToHangButton = ({ 
  variant = 'outline', 
  size = 'default',
  className = '',
  shareText = 'Open to Hang',
  removeText = 'Stop Hanging'
}: OpenToHangButtonProps) => {
  const { user } = useAuth();
  const { shareHangLocation, stopHanging, checkHangStatus, isLoading, isOpenToHang } = useOpenToHang();
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [showMoodDialog, setShowMoodDialog] = useState(false);

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

  const handleOpenToHang = async () => {
    if (!user) {
      toast.error('Please log in to share your location');
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast.error('Your browser doesn\'t support location sharing');
      return;
    }

    // Show helpful message if permission was denied
    if (permissionState === 'denied') {
      toast.error('Location access denied. Please enable location access in browser settings and refresh.');
      return;
    }

    // Show mood selection dialog instead of immediately sharing location
    setShowMoodDialog(true);
  };

  const handleMoodSelect = async (mood: string) => {
    const success = await shareHangLocation(mood);
    if (success) {
      // Auto-refresh status after sharing
      setTimeout(() => {
        checkHangStatus();
      }, 500);
    }
  };

  const handleStopHanging = async () => {
    if (!user) return;
    
    const success = await stopHanging();
    if (success) {
      // Auto-refresh status after stopping
      setTimeout(() => {
        checkHangStatus();
      }, 500);
    }
  };

  if (isOpenToHang) {
    return (
      <>
        <Button
          onClick={handleStopHanging}
          disabled={isLoading}
          variant="outline"
          size={size}
          className={`${className} bg-destructive/5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/40 transition-all duration-200 font-medium`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin ml-2" />
          ) : (
            <X className="w-4 h-4 ml-2" />
          )}
          {removeText}
        </Button>
        
        <MoodSelectionDialog 
          isOpen={showMoodDialog}
          onClose={() => setShowMoodDialog(false)}
          onMoodSelect={handleMoodSelect}
        />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleOpenToHang}
        disabled={isLoading || permissionState === 'denied'}
        variant="default"
        size={size}
        className={`${className} bg-gradient-to-r from-warm-peach to-warm-orange text-white hover:from-warm-muted hover:to-warm-peach shadow-md hover:shadow-lg transition-all duration-200 font-medium ${permissionState === 'denied' ? 'opacity-50' : ''}`}
        title={permissionState === 'denied' ? 'Location access denied - please enable access in browser settings' : ''}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
        ) : permissionState === 'denied' ? (
          <AlertCircle className="w-4 h-4 ml-2" />
        ) : null}
        {permissionState === 'denied' ? 'Access Denied' : shareText}
      </Button>
      
      <MoodSelectionDialog 
        isOpen={showMoodDialog}
        onClose={() => setShowMoodDialog(false)}
        onMoodSelect={handleMoodSelect}
      />
    </>
  );
};

export default OpenToHangButton;