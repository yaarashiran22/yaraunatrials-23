
import { X, MessageCircle, Share, Heart, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useItemDetails } from "@/hooks/useItemDetails";

// Location mapping from English to Hebrew
const locationMapping: Record<string, string> = {
  'tel-aviv': 'תל אביב',
  'florentin': 'פלורנטין', 
  'lev-hair': 'לב העיר',
  'jerusalem': 'ירושלים',
  'ramat-gan': 'רמת גן',
  'givatayim': 'גבעתיים'
};

interface MarketplacePopupProps {
  isOpen: boolean;
  onClose: () => void;
  item?: {
    id?: string;
    title: string;
    image: string;
    price: string;
    description?: string;
    seller?: {
      id?: string;
      name: string;
      image: string;
      location: string;
    };
    condition?: string;
    type?: string;
    allItems?: any[];
    currentIndex?: number;
  };
}

const MarketplacePopup = ({ isOpen, onClose, item }: MarketplacePopupProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Navigation state
  const allItems = item?.allItems || [];
  const currentIndex = item?.currentIndex || 0;

  // Fetch item details with uploader info if item.id exists
  const { item: itemDetails, loading: itemLoading } = useItemDetails(item?.id || "");

  // For faster loading, use passed item data immediately if available
  const hasItemData = item && item.title && item.image;
  
  // Show loading only if we don't have basic item data and we're fetching details
  if (itemLoading && !hasItemData && item?.id) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl w-full max-w-sm p-8 mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-foreground">טוען פרטי פריט...</p>
          </div>
        </div>
      </div>
    );
  }

  const defaultItem = {
    id: "1",
    title: "חולצות אייטים",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
    price: "₪45",
    description: "חולצות באיכות מעולה, נלבשו מספר פעמים בלבד. מתאים למידות M-L.",
    seller: {
      id: "default",
      name: "יערה שיין",
      image: "https://images.unsplash.com/photo-1494790108755-2616b66dfd8d?w=100&h=100&fit=crop",
      location: "תל אביב"
    },
    condition: "כמו חדש"
  };

  // Create display item with uploader info if available, otherwise use passed item or default
  const displayItem = itemDetails ? {
    id: itemDetails.id,
    title: itemDetails.title,
    image: itemDetails.image_url || item?.image || defaultItem.image,
    price: itemDetails.price ? `₪${itemDetails.price}` : item?.price || defaultItem.price,
    description: itemDetails.description || item?.description || defaultItem.description,
    seller: {
      id: itemDetails.uploader.id,
      name: itemDetails.uploader.name || "משתמש",
      image: itemDetails.uploader.profile_image_url || defaultItem.seller.image,
      location: itemDetails.uploader.location || "לא צוין"
    },
    condition: item?.condition || defaultItem.condition
  } : (item || defaultItem);

  console.log('MarketplacePopup - itemDetails:', itemDetails);
  console.log('MarketplacePopup - mobile_number:', itemDetails?.mobile_number);

  const handleContact = () => {
    toast({
      title: "פותח צ'אט",
      description: "מפנה לשיחה עם המוכר",
    });
  };

  const handleShare = () => {
    toast({
      title: "שותף בהצלחה!",
      description: "הפריט שותף ברשתות החברתיות",
    });
  };

  const handleViewProfile = () => {
    if (displayItem.seller?.id) {
      navigate(`/profile/${displayItem.seller.id}`);
      onClose();
    }
  };

  // Navigation functions
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevItem = allItems[currentIndex - 1];
      const newItem = {
        ...item,
        id: prevItem.id,
        title: prevItem.title,
        image: prevItem.image_url || prevItem.image,
        price: prevItem.price ? `₪${prevItem.price}` : undefined,
        description: prevItem.description || `${prevItem.title} במצב מעולה.`,
        currentIndex: currentIndex - 1
      };
      // Trigger re-render by updating the parent's selected item
      onClose();
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigateToItem', { detail: newItem }));
      }, 100);
    }
  };

  const handleNext = () => {
    if (currentIndex < allItems.length - 1) {
      const nextItem = allItems[currentIndex + 1];
      const newItem = {
        ...item,
        id: nextItem.id,
        title: nextItem.title,
        image: nextItem.image_url || nextItem.image,
        price: nextItem.price ? `₪${nextItem.price}` : undefined,
        description: nextItem.description || `${nextItem.title} במצב מעולה.`,
        currentIndex: currentIndex + 1
      };
      // Trigger re-render by updating the parent's selected item
      onClose();
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigateToItem', { detail: newItem }));
      }, 100);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      {/* Left Navigation Button */}
      {allItems.length > 1 && currentIndex > 0 && (
        <Button
          variant="ghost"
          size="lg"
          onClick={handlePrevious}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-foreground shadow-lg rounded-full p-3 h-12 w-12"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}
      
      {/* Right Navigation Button */}
      {allItems.length > 1 && currentIndex < allItems.length - 1 && (
        <Button
          variant="ghost"
          size="lg"
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-foreground shadow-lg rounded-full p-3 h-12 w-12"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}

      <div className="bg-background rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            {allItems.length > 1 && (
              <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {currentIndex + 1} / {allItems.length}
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleShare}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>

        {/* Page Indicators */}
        {allItems.length > 1 && (
          <div className="flex justify-center gap-2 py-3 border-b bg-muted/20">
            {allItems.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-primary shadow-sm' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Item Image */}
          <div className="relative mb-6">
            <div className="border-4 border-blue-400 rounded-2xl overflow-hidden">
              <img 
                src={displayItem.image}
                alt={displayItem.title}
                className="w-full h-64 object-cover"
              />
            </div>
            
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-full bg-card/80 backdrop-blur-sm text-red-500"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-4">
            <div className="text-center">
              {(itemDetails?.price || item?.price) && (
                <h3 className="text-2xl font-bold text-foreground mb-2">{displayItem.price}</h3>
              )}
              <p className="text-lg font-semibold text-foreground">{displayItem.title}</p>
            </div>
            
            {displayItem.description && (
              <p className="text-foreground leading-relaxed text-center">
                {displayItem.description}
              </p>
            )}
            
            {/* Item Location and Date for Join Items */}
            {itemDetails?.category === 'מוזמנים להצטרף' && (
              <div className="space-y-3 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 text-base font-medium text-foreground">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>{locationMapping[itemDetails.location] || itemDetails.location || 'לא צוין'}</span>
                </div>
                <div className="flex items-center gap-3 text-base font-medium text-foreground">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>
                    {new Date(itemDetails.created_at).toLocaleDateString('he-IL', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Seller Info */}
            {displayItem.seller && (
              <div 
                className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleViewProfile}
              >
                <img 
                  src={displayItem.seller.image}
                  alt={displayItem.seller.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{displayItem.seller.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{displayItem.seller.location}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Request to Join Section - only for join me items */}
          {(item?.type === 'recommendation' || itemDetails?.category === 'מוזמנים להצטרף') && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-lg font-semibold text-foreground mb-3 text-center">בקשה להצטרפות</h4>
              <p className="text-foreground text-center mb-4">
                שלח בקשה להצטרפות לפעילות זו והמארגן יחזור אליך
              </p>
              <Button 
                onClick={handleContact}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-lg font-medium"
              >
                שלח בקשת הצטרפות
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <Button 
              variant={itemDetails?.mobile_number ? "default" : "outline"}
              disabled={!itemDetails?.mobile_number}
              className={`flex-1 h-12 rounded-2xl text-lg font-medium ${
                itemDetails?.mobile_number ? 'cursor-default' : 'cursor-default opacity-60'
              }`}
            >
              <MessageCircle className="h-5 w-5 ml-2" />
              {itemDetails?.mobile_number || 'אין נייד'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePopup;
