
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import FilterPopup from "@/components/FilterPopup";
import UniformCard from "@/components/UniformCard";
import NotificationsPopup from "@/components/NotificationsPopup";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { useLanguage } from "@/contexts/LanguageContext";

import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";
import communityEvent from "@/assets/community-event.jpg";

const ArtistsCreatorsPage = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { t } = useLanguage();

  const artists = [
    {
      image: profile1,
      title: "יערה שיין",
      subtitle: "צלמת ויוצרת תוכן"
    },
    {
      image: profile2,
      title: "אבי כהן",
      subtitle: "מעצב גרפי"
    },
    {
      image: profile3,
      title: "רעי לוי",
      subtitle: "אמנית דיגיטלית"
    },
    {
      image: communityEvent,
      title: "דנה רוזן",
      subtitle: "צלמת אירועים"
    },
    {
      image: profile1,
      title: "נועה גרין",
      subtitle: "מאיירת"
    },
    {
      image: profile2,
      title: "שחר בלו",
      subtitle: "מוזיקאי"
    },
    {
      image: profile3,
      title: "מיכל גולד",
      subtitle: "כותבת"
    },
    {
      image: communityEvent,
      title: "רון סילבר",
      subtitle: "פסל"
    }
  ];

  const { searchQuery, setSearchQuery, filteredItems, highlightText } = useSearch({
    items: artists,
    searchFields: ['title', 'subtitle']
  });

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <Header 
        title="אמנים ויוצרים"
        showSearch={true}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="חיפוש באמנים ויוצרים..."
        onNotificationsClick={() => setShowNotifications(true)}
      />
      
      {searchQuery && (
        <div className="px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} תוצאות נמצאו
          </p>
        </div>
      )}
      
      <main className="px-4 py-6">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            פילטר
          </Button>
        </div>
        
        {searchQuery && filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">לא נמצאו תוצאות עבור "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((artist, index) => (
              <UniformCard
                key={index}
                image={artist.image}
                title={searchQuery ? highlightText(artist.title, searchQuery) : artist.title}
                subtitle={artist.subtitle}
                type="business"
              />
            ))}
          </div>
        )}
      </main>

      <FilterPopup 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
      
      <NotificationsPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <BottomNavigation />
    </div>
  );
};

export default ArtistsCreatorsPage;
