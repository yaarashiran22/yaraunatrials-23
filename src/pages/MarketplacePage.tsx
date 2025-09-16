
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import BusinessFilterPopup from "@/components/BusinessFilterPopup";
import UniformCard from "@/components/UniformCard";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { useLanguage } from "@/contexts/LanguageContext";
import { useItems } from "@/hooks/useItems";

import dressItem from "@/assets/dress-item.jpg";
import furnitureItem from "@/assets/furniture-item.jpg";
import communityEvent from "@/assets/community-event.jpg";

const MarketplacePage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { items, loading } = useItems();

  // Transform database items to display format
  const marketplaceItems = items.map(item => ({
    id: item.id,
    image: item.image_url || dressItem, // fallback image
    title: item.title,
    subtitle: `${item.price ? `₪${item.price}` : ''} • ${item.location || 'תל אביב'}`,
    price: item.price ? `₪${item.price}` : undefined,
    data: item // store full item data for favorites
  }));

  const { searchQuery, setSearchQuery, filteredItems, highlightText } = useSearch({
    items: marketplaceItems,
    searchFields: ['title', 'subtitle']
  });

  return (
    <div className="min-h-screen bg-background pb-20" dir="ltr">
      <Header 
        title="מרקט פליס"
        showSearch={true}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="חיפוש במרקט פליס..."
      />
      
      {/* Filter Button */}
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span>פילטר</span>
          </Button>
          
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} תוצאות נמצאו
            </p>
          )}
        </div>
      </div>
      
      <main className="px-4 py-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">טוען פריטים...</p>
          </div>
        ) : searchQuery && filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">לא נמצאו תוצאות עבור "{searchQuery}"</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">אין פריטים להצגה עדיין</p>
            <p className="text-sm text-muted-foreground mt-2">הוסף פריט ראשון!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <UniformCard
                key={item.id}
                id={item.id}
                image={item.image}
                title={searchQuery ? highlightText(item.title, searchQuery) : item.title}
                altText={item.title}
                subtitle={item.subtitle}
                price={item.price}
                type="marketplace"
                onClick={() => navigate(`/item/${item.id}`)}
                favoriteData={item.data}
              />
            ))}
          </div>
        )}
      </main>

      <BusinessFilterPopup 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default MarketplacePage;
