import { useState, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import MarketplacePopup from "@/components/MarketplacePopup";
import NotificationsPopup from "@/components/NotificationsPopup";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRecommendations } from "@/hooks/useRecommendations";

import coffeeShop from "@/assets/coffee-shop.jpg";
import profile1 from "@/assets/profile-1.jpg";

// Predefined neighborhoods in Tel Aviv - memoized for performance
const neighborhoods = [
  "כל השכונות",
  "לב העיר",
  "נחלת בנימין", 
  "רוטשילד",
  "פלורנטין",
  "שפירא",
  "יפו העתיקה",
  "עג'מי",
  "נווה צדק",
  "כרם התימנים",
  "שכונת מונטיפיורי",
  "רמת אביב",
  "צפון ישן",
  "שינקין",
  "דיזנגוף",
  "הרצליה",
  "בת ים",
  "חולון"
] as const;

// Price filter options - memoized for performance
const priceOptions = [
  "כל המחירים",
  "חינם", 
  "עד 50 ₪",
  "50-100 ₪",
  "100-200 ₪",
  "מעל 200 ₪"
] as const;

const AllRecommendationsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { recommendations, loading } = useRecommendations();

  // State management
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isItemPopupOpen, setIsItemPopupOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("כל השכונות");
  const [priceFilter, setPriceFilter] = useState("כל המחירים");

  // Optimized filtering with useMemo for better performance
  const filteredItems = useMemo(() => {
    if (!recommendations.length) return [];
    
    return recommendations.filter(item => {
      // Search filter - case insensitive
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = item.title.toLowerCase().includes(query) ||
                             item.description?.toLowerCase().includes(query) ||
                             item.location?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Neighborhood filter
      if (selectedNeighborhood !== "כל השכונות") {
        if (!item.location?.includes(selectedNeighborhood)) return false;
      }

      // Price filter
      if (priceFilter !== "כל המחירים") {
        const price = item.price || 0;
        switch (priceFilter) {
          case "חינם":
            if (price !== 0) return false;
            break;
          case "עד 50 ₪":
            if (price === 0 || price > 50) return false;
            break;
          case "50-100 ₪":
            if (price <= 50 || price > 100) return false;
            break;
          case "100-200 ₪":
            if (price <= 100 || price > 200) return false;
            break;
          case "מעל 200 ₪":
            if (price <= 200) return false;
            break;
        }
      }

      return true;
    });
  }, [recommendations, searchQuery, selectedNeighborhood, priceFilter]);

  // Optimized event handlers with useCallback
  const handleItemClick = useCallback((item: any) => {
    const itemDetails = {
      id: item.id,
      title: item.title,
      image: item.image_url || coffeeShop,
      price: item.price ? `₪${item.price}` : undefined,
      description: item.description || `${item.title} במצב מעולה.`,
      seller: {
        name: "יערה שיין",
        image: profile1,
        location: item.location || "תל אביב"
      },
      condition: "כמו חדש",
      type: 'recommendation'
    };
    setSelectedItem(itemDetails);
    setIsItemPopupOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedNeighborhood("כל השכונות");
    setPriceFilter("כל המחירים");
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Custom Header with Back Button */}
      <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">כל ההצעות</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotifications(true)}
          className="p-2"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Search and Filter Section */}
      <div className="px-4 py-4 space-y-4 bg-card/30 backdrop-blur-sm border-b">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="חיפוש הצעות..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filter Options - Always Visible */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">שכונה</label>
              <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {neighborhoods.map((neighborhood) => (
                    <SelectItem key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">מחיר</label>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(selectedNeighborhood !== "כל השכונות" || priceFilter !== "כל המחירים") && (
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                נקה סינונים
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <main className="px-4 py-4">
        <div className="mb-4 text-sm text-muted-foreground">
          נמצאו {filteredItems.length} הצעות
        </div>

        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="w-full aspect-[3/4] bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-lg font-semibold mb-2">לא נמצאו הצעות</h3>
            <p className="text-muted-foreground mb-4">נסה לשנות את הסינונים או החיפוש</p>
            <Button variant="outline" onClick={clearFilters}>
              נקה סינונים
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredItems.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}
      </main>

      <MarketplacePopup 
        isOpen={isItemPopupOpen}
        onClose={() => setIsItemPopupOpen(false)}
        item={selectedItem}
      />

      <NotificationsPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <BottomNavigation />
    </div>
  );
};

// Memoized RecommendationCard component for better performance
const RecommendationCard = memo(({ item, onClick }: { item: any; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="cursor-pointer bg-card rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow"
  >
    <div className="aspect-[3/4] w-full">
      {item.image_url ? (
        <img 
          src={item.image_url} 
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <span className="text-lg">🏪</span>
        </div>
      )}
    </div>
    <div className="p-2">
      <h3 className="font-semibold text-xs text-right mb-1 truncate leading-tight">
        {item.title}
      </h3>
      {item.location && (
        <p className="text-[10px] text-muted-foreground text-right truncate">
          📍 {item.location}
        </p>
      )}
      {item.price && item.price > 0 ? (
        <p className="text-[10px] font-medium text-primary text-right mt-1">
          {item.price} ₪
        </p>
      ) : (
        <p className="text-[10px] font-medium text-green-600 text-right mt-1">
          חינם
        </p>
      )}
    </div>
  </div>
));

export default AllRecommendationsPage;