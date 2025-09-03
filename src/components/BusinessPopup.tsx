import { X, Phone, Navigation, Share, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  SimplifiedModal, 
  SimplifiedModalContent, 
  SimplifiedModalHeader, 
  SimplifiedModalTitle, 
  SimplifiedModalBody 
} from "@/components/ui/simplified-modal";

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
    <SimplifiedModal open={isOpen} onOpenChange={onClose}>
      <SimplifiedModalContent className="max-w-md">
        <SimplifiedModalHeader>
          <SimplifiedModalTitle className="text-center">
            {businessData.title}
          </SimplifiedModalTitle>
          <Button 
            variant="ghost" 
            size="default"
            onClick={handleShare}
            className="absolute right-16 top-6"
          >
            <Share className="h-5 w-5" />
          </Button>
        </SimplifiedModalHeader>

        <SimplifiedModalBody>
          {/* Business Image */}
          <div className="relative mb-content-normal">
            <div className="border-4 border-accent rounded-3xl overflow-hidden">
              <img 
                src={businessData.image}
                alt={businessData.title}
                className="w-full h-64 object-cover"
              />
            </div>
            
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-card/80 backdrop-blur-sm text-destructive hover:bg-card"
              >
                <Heart className="h-5 w-5 fill-current" />
              </Button>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-content-normal text-center mb-content-normal">
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">{businessData.title}</h3>
              <p className="text-base text-muted-foreground">{businessData.subtitle}</p>
            </div>
            
            {businessData.description && (
              <p className="text-base text-foreground leading-relaxed">
                {businessData.description}
              </p>
            )}
            
            <div className="space-y-3 text-base">
              {businessData.address && (
                <div className="flex items-center gap-3 justify-center">
                  <Navigation className="h-5 w-5 text-primary" />
                  <span className="text-foreground">{businessData.address}</span>
                </div>
              )}
              
              {businessData.phone && (
                <div className="flex items-center gap-3 justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-foreground">{businessData.phone}</span>
                </div>
              )}
              
              {businessData.hours && (
                <div className="text-muted-foreground">
                  שעות פעילות: {businessData.hours}
                </div>
              )}
              
              {businessData.instagram && (
                <div className="text-muted-foreground">
                  אינסטגרם: <span className="text-foreground">{businessData.instagram}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={handleCall}
                size="lg"
                className="flex-1 btn-3d"
              >
                <Phone className="h-5 w-5 ml-2" />
                התקשר
              </Button>
              <Button 
                onClick={handleNavigate}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Navigation className="h-5 w-5 ml-2" />
                נווט
              </Button>
            </div>
            
            <Button 
              onClick={handleViewProfile}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <User className="h-5 w-5 ml-2" />
              {businessData.type === 'artist' ? 'פרופיל אמן' : 'פרופיל עסק'}
            </Button>
          </div>
        </SimplifiedModalBody>
      </SimplifiedModalContent>
    </SimplifiedModal>
  );
};

export default BusinessPopup;