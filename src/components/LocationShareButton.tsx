import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';
import { useUserLocations } from '@/hooks/useUserLocations';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
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
  const { user } = useEnhancedAuth();
  const { userLocations, sharing, shareLocation, removeLocation } = useUserLocations();
  const [isRemoving, setIsRemoving] = useState(false);

  // Check if current user has shared their location
  const userHasSharedLocation = userLocations.some(loc => loc.user_id === user?.id);

  const handleLocationShare = async () => {
    if (!user) {
      toast.error('יש להתחבר כדי לשתף מיקום');
      return;
    }

    const result = await shareLocation();
    
    if (result.success) {
      toast.success('המיקום שותף בהצלחה!');
    } else {
      toast.error(result.error || 'שגיאה בשיתוף המיקום');
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
      disabled={sharing}
      variant={variant}
      size={size}
      className={className}
    >
      {sharing ? (
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-2" />
      ) : (
        <MapPin className="w-4 h-4 ml-2" />
      )}
      שתף מיקום
    </Button>
  );
};

export default LocationShareButton;