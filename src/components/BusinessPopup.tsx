
import { X, Phone, Navigation, Share, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface BusinessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  business?: {
    id?: string;
    title: string;
    image: string;
    subtitle: string;
    description?: string;
    phone?: string;
    address?: string;
    instagram?: string;
    hours?: string;
    type?: 'business' | 'artist';
  };
}

const BusinessPopup = ({ isOpen, onClose, business }: BusinessPopupProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const defaultBusiness = {
    id: "1",
    title: "WAXUP COFFEE",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
    subtitle: "בית קפה במסעדה",
    description: "בית קפה מקומי עם אווירה חמה ואוכל טעים. מומלץ לבקר בשעות השקט.",
    phone: "03-1234567",
    address: "רחוב הנביאים 15, תל אביב",
    instagram: "waxupcoffee@",
    hours: "07:00-22:00",
    type: 'business' as const
  };

  const businessData = business || defaultBusiness;

  const handleCall = () => {
    if (businessData.phone) {
      window.open(`tel:${businessData.phone}`, '_self');
    }
  };

  const handleNavigate = () => {
    toast({
      title: t('popups.navigationOpened'),
      description: t('popups.redirectingToMaps'),
    });
  };

  const handleShare = () => {
    toast({
      title: t('popups.sharedSuccessfully'),
      description: t('popups.businessSharedOnSocial'),
    });
  };

  const handleViewProfile = () => {
    if (businessData.type === 'artist') {
      navigate(`/artist/${businessData.id}`);
    } else {
      navigate(`/neighborhood/${businessData.id}`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <h2 className="text-lg font-bold text-foreground">{businessData.title}</h2>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleShare}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Business Image */}
          <div className="relative mb-6">
            <div className="border-4 border-green-400 rounded-2xl overflow-hidden">
              <img 
                src={businessData.image}
                alt={businessData.title}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-full bg-card/80 backdrop-blur-sm text-red-500"
              >
                <Heart className="h-4 w-4 fill-current" />
              </Button>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">{businessData.title}</h3>
              <p className="text-sm text-muted-foreground">{businessData.subtitle}</p>
            </div>
            
            {businessData.description && (
              <p className="text-foreground leading-relaxed text-center">
                {businessData.description}
              </p>
            )}
            
            <div className="space-y-2 text-sm">
              {businessData.address && (
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{businessData.address}</span>
                </div>
              )}
              
              {businessData.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{businessData.phone}</span>
                </div>
              )}
              
              {businessData.hours && (
                <div className="text-center text-muted-foreground">
                  שעות פעילות: {businessData.hours}
                </div>
              )}
              
              {businessData.instagram && (
                <div className="text-center text-muted-foreground">
                  אינסטגרם: <span className="text-foreground">{businessData.instagram}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <div className="flex gap-3">
              <Button 
                onClick={handleCall}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-lg font-medium"
              >
                <Phone className="h-5 w-5 ml-2" />
                התקשר
              </Button>
              <Button 
                onClick={handleNavigate}
                variant="outline"
                className="flex-1 h-12 rounded-2xl text-lg font-medium"
              >
                <Navigation className="h-5 w-5 ml-2" />
                נווט
              </Button>
            </div>
            
            <Button 
              onClick={handleViewProfile}
              variant="outline"
              className="w-full h-12 rounded-2xl text-lg font-medium"
            >
              <User className="h-5 w-5 ml-2" />
              {businessData.type === 'artist' ? 'פרופיל אמן' : 'פרופיל עסק'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPopup;
