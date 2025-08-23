
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import UniformCard from "@/components/UniformCard";
import { useSearch } from "@/hooks/useSearch";
import { useLanguage } from "@/contexts/LanguageContext";

import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";
import communityEvent from "@/assets/community-event.jpg";

const ArtistsPage = () => {
  const { t } = useLanguage();
  
  const artists = [
    {
      image: profile1,
      title: "Roy's Photography",
      subtitle: "Event Photography"
    },
    {
      image: profile2,
      title: "Yael Artist",
      subtitle: "Digital Art"
    },
    {
      image: profile3,
      title: "Avi Photographer",
      subtitle: "Street Photography"
    },
    {
      image: communityEvent,
      title: "Naama Creator",
      subtitle: "Graphic Design"
    },
    {
      image: profile1,
      title: "Rea Designer",
      subtitle: "Interior Design"
    },
    {
      image: profile2,
      title: "Dana Artist",
      subtitle: "Painting & Installation"
    },
  ];

  const { searchQuery, setSearchQuery, filteredItems, highlightText } = useSearch({
    items: artists,
    searchFields: ['title', 'subtitle']
  });

  return (
    <div className="min-h-screen bg-background pb-20" dir="ltr">
      <Header 
        title={!searchQuery ? t('artists.title') : undefined}
        showSearch={true}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('artists.searchPlaceholder')}
      />
      
      {searchQuery && (
        <div className="container mx-auto px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} {t('common.resultsFound')}
          </p>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-6">
        {searchQuery && filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('common.noResults')} "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((artist, index) => (
              <UniformCard
                key={index}
                image={artist.image}
                title={searchQuery ? highlightText(artist.title, searchQuery) : artist.title}
                altText={artist.title}
                subtitle={artist.subtitle}
                type="business"
              />
            ))}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ArtistsPage;
