
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, Share, Heart, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import dressItem from "@/assets/dress-item.jpg";

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data - in a real app this would come from an API
  const itemData = {
    id: id || "1",
    title: "חולצות אייטים",
    image: dressItem,
    price: "₪45",
    description: "חולצות באיכות מעולה, נלבשו מספר פעמים בלבד. מתאים למידות M-L. החולצות נשמרו בקפדנות וללא כתמים או נזקים.",
    condition: "כמו חדש",
    category: "בגדים",
    size: "M-L",
    seller: {
      name: "יערה שיין",
      image: "https://images.unsplash.com/photo-1494790108755-2616b66dfd8d?w=100&h=100&fit=crop",
      location: "תל אביב",
      rating: 4.8,
      reviewCount: 23
    },
    postedDate: "לפני 2 ימים"
  };

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
    navigate(`/profile/${itemData.seller.name}`);
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
                className="w-12 h-12 rounded-full object-cover"
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
              onClick={handleContact}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-lg font-medium"
            >
              <MessageCircle className="h-5 w-5 ml-2" />
              צור קשר
            </Button>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ItemDetailsPage;
