
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import BusinessFilterPopup from "@/components/BusinessFilterPopup";
import BusinessPopup from "@/components/BusinessPopup";
import UniformCard from "@/components/UniformCard";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useLanguage } from "@/contexts/LanguageContext";

import coffeeShop from "@/assets/coffee-shop.jpg";
import vintageStore from "@/assets/vintage-store.jpg";
import communityEvent from "@/assets/community-event.jpg";

const RecommendedPage = () => {
  const { t } = useLanguage();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [isBusinessPopupOpen, setIsBusinessPopupOpen] = useState(false);

  const recommendations = [
    {
      id: "1",
      image: coffeeShop,
      title: "WAXUP COFFEE",
      subtitle: "בית קפה במסעדה",
      type: 'business' as const
    },
    {
      id: "2",
      image: vintageStore,
      title: "מרידיאן קפה",
      subtitle: "בית קפה במסעדה",
      type: 'business' as const
    },
    {
      id: "3",
      image: communityEvent,
      title: "TRIANGLE VINTAGE",
      subtitle: "חנות בגדי וינטג'",
      type: 'business' as const
    },
    {
      id: "4",
      image: coffeeShop,
      title: "ביסטרו המקומי",
      subtitle: "מסעדה",
      type: 'business' as const
    },
    {
      id: "5",
      image: vintageStore,
      title: "גלריה צפון",
      subtitle: "גלריה אמנות",
      type: 'business' as const
    },
    {
      id: "6",
      image: communityEvent,
      title: "חנות הספרים",
      subtitle: "ספרים ותרבות",
      type: 'business' as const
    }
  ];

  const { searchQuery, setSearchQuery, filteredItems, highlightText } = useSearch({
    items: recommendations,
    searchFields: ['title', 'subtitle']
  });

  const handleBusinessClick = (business: any) => {
    const businessDetails = {
      id: business.id,
      title: business.title,
      image: business.image,
      subtitle: business.subtitle,
      description: `${business.title} - ${business.subtitle}. מקום מומלץ לבקר בשכונה שלנו.`,
      phone: "03-1234567",
      address: "תל אביב",
      instagram: business.title.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '') + "@",
      hours: "08:00-22:00",
      type: business.type
    };
    setSelectedBusiness(businessDetails);
    setIsBusinessPopupOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title={!searchQuery ? t('recommended.title') : undefined}
        showSearch={true}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('recommended.searchPlaceholder')}
      />
      
      {/* Filter Button */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span>{t('common.filter')}</span>
          </Button>
          
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} {t('common.resultsFound')}
            </p>
          )}
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-3">
        {searchQuery && filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('common.noResults')} "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item, index) => (
              <UniformCard
                key={index}
                id={item.id}
                image={item.image}
                title={searchQuery ? highlightText(item.title, searchQuery) : item.title}
                altText={item.title}
                subtitle={item.subtitle}
                type="business"
                isLiked={Math.random() > 0.5}
                onClick={() => handleBusinessClick(item)}
                favoriteData={{
                  id: item.id,
                  title: item.title,
                  image: item.image,
                  subtitle: item.subtitle,
                  description: `${item.title} - ${item.subtitle}. מקום מומלץ לבקר בשכונה שלנו.`,
                  phone: "03-1234567",
                  address: "תל אביב",
                  instagram: item.title.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '') + "@",
                  hours: "08:00-22:00",
                  type: item.type
                }}
              />
            ))}
          </div>
        )}
      </main>

      <BusinessFilterPopup 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      <BusinessPopup 
        isOpen={isBusinessPopupOpen}
        onClose={() => setIsBusinessPopupOpen(false)}
        business={selectedBusiness}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default RecommendedPage;
