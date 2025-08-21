
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, MessageCircle, Share, Heart, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { useItemDetails } from "@/hooks/useItemDetails";
import dressItem from "@/assets/dress-item.jpg";
import profile1 from "@/assets/profile-1.jpg";

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { item, loading, error } = useItemDetails(id || '');

  // Get carousel data from navigation state
  const { itemsList = [], currentIndex = 0, fromHomepage = false } = location.state || {};

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center">טוען...</div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-muted-foreground">{error || 'פריט לא נמצא'}</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              חזרה לעמוד הבית
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const itemData = {
    id: item.id,
    title: item.title,
    image: item.image_url || dressItem,
    price: item.price ? `₪${item.price}` : undefined,
    description: item.description || `${item.title} במצב מעולה.`,
    condition: "כמו חדש",
    category: item.category || "כללי",
    size: "M-L", // Could be added to database schema if needed
    seller: {
      id: item.uploader.id,
      name: item.uploader.name || "משתמש",
      image: item.uploader.small_profile_photo || item.uploader.profile_image_url || profile1,
      location: item.uploader.location || item.location || "לא צוין",
      rating: 4.8, // Could be calculated from reviews if implemented
      reviewCount: 23 // Could be calculated from reviews if implemented
    },
    postedDate: new Date(item.created_at).toLocaleDateString('he-IL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  };

  console.log('ItemDetailsPage - item:', item);
  console.log('ItemDetailsPage - mobile_number:', item?.mobile_number);

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

  const handleSellerProfile = () => {
    navigate(`/profile/${itemData.seller.id}`);
  };

  // Carousel navigation functions
  const navigateToPrevious = () => {
    if (!fromHomepage || itemsList.length === 0) return;
    const currentIdx = itemsList.findIndex((i: any) => i.id === id);
    const prevIdx = currentIdx > 0 ? currentIdx - 1 : itemsList.length - 1;
    const prevItem = itemsList[prevIdx];
    navigate(`/item/${prevItem.id}`, {
      state: { itemsList, currentIndex: prevIdx, fromHomepage }
    });
  };

  const navigateToNext = () => {
    if (!fromHomepage || itemsList.length === 0) return;
    const currentIdx = itemsList.findIndex((i: any) => i.id === id);
    const nextIdx = currentIdx < itemsList.length - 1 ? currentIdx + 1 : 0;
    const nextItem = itemsList[nextIdx];
    navigate(`/item/${nextItem.id}`, {
      state: { itemsList, currentIndex: nextIdx, fromHomepage }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Item Image */}
        <div className="relative mb-6">
          <div className="border-4 border-blue-400 rounded-2xl overflow-hidden">
            <img 
              src={itemData.image}
              alt={itemData.title}
              className="w-full h-80 object-cover"
            />
          </div>
          
          {/* Navigation arrows - only show if from homepage */}
          {fromHomepage && itemsList.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={navigateToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={navigateToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          
          {/* Share and favorite buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-2 rounded-full bg-card/80 backdrop-blur-sm"
            >
              <Share className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-full bg-card/80 backdrop-blur-sm text-red-500"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Page indicator - only show if from homepage */}
          {fromHomepage && itemsList.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
              {itemsList.map((_: any, index: number) => {
                const currentIdx = itemsList.findIndex((i: any) => i.id === id);
                return (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentIdx ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">{itemData.title}</h1>
            <p className="text-2xl font-bold text-primary mb-4">{itemData.price}</p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
              <span>מצב: <span className="text-primary font-semibold">{itemData.condition}</span></span>
              <span>קטגוריה: {itemData.category}</span>
              <span>מידה: {itemData.size}</span>
            </div>
            
            <p className="text-sm text-muted-foreground">{itemData.postedDate}</p>
          </div>

          {/* Description */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">תיאור הפריט</h3>
            <p className="text-foreground leading-relaxed">{itemData.description}</p>
          </div>

          {/* Seller Info */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">מוכר</h3>
            <div className="flex items-center gap-3">
              <img 
                src={itemData.seller.image}
                alt={itemData.seller.name}
                className="w-12 h-12 rounded-full object-cover cursor-pointer"
                onClick={handleSellerProfile}
              />
              <div className="flex-1">
                <p className="font-semibold text-foreground">{itemData.seller.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{itemData.seller.location}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{itemData.seller.rating}</span>
                  <span className="text-muted-foreground">({itemData.seller.reviewCount} ביקורות)</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSellerProfile}
              >
                פרופיל
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <Button 
              disabled={!item.mobile_number}
              className={`flex-1 h-12 rounded-2xl text-lg font-medium ${
                item.mobile_number 
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground cursor-default' 
                  : 'bg-muted text-muted-foreground cursor-default opacity-60'
              }`}
            >
              <MessageCircle className="h-5 w-5 ml-2" />
              {item.mobile_number || 'אין נייד'}
            </Button>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ItemDetailsPage;
