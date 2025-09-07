import React, { useState, useEffect } from 'react';
import { 
  SimplifiedModal, 
  SimplifiedModalContent, 
  SimplifiedModalHeader, 
  SimplifiedModalTitle, 
  SimplifiedModalBody 
} from '@/components/ui/simplified-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, X, User, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSearch } from '@/contexts/SearchContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  specialties: string[] | null;
  profile_image_url: string | null;
}

interface Item {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number | null;
  image_url: string | null;
}

const SearchPopup = () => {
  const { isSearchOpen, closeSearch } = useSearch();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setProfiles([]);
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      // Search profiles - including specialties with partial matching
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, username, bio, specialties, profile_image_url')
        .or(`name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%,array_to_string(specialties,',').ilike.%${query}%`)
        .limit(10);

      // Search items
      const { data: itemsData } = await supabase
        .from('items')
        .select('id, title, description, category, price, image_url')
        .eq('status', 'active')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(10);

      setProfiles(profilesData || []);
      setItems(itemsData || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    closeSearch();
  };

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
    closeSearch();
  };

  const handleClose = () => {
    setSearchQuery('');
    setProfiles([]);
    setItems([]);
    closeSearch();
  };

  return (
    <SimplifiedModal open={isSearchOpen} onOpenChange={handleClose}>
      <SimplifiedModalContent className="max-w-2xl max-h-[80vh] bg-violet-50 dark:bg-violet-950/40">
        <SimplifiedModalHeader>
          <SimplifiedModalTitle className="flex items-center gap-2 justify-center">
            <Search className="h-6 w-6" />
            {t('common.search')}
          </SimplifiedModalTitle>
        </SimplifiedModalHeader>
        
        <SimplifiedModalBody>
          <div className="relative mb-content-normal">
            <Input
              placeholder="Search for users, items, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-12 text-base"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-content-normal max-h-[50vh]">
            {loading && (
              <div className="flex items-center justify-center py-content-spacious">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {!loading && searchQuery && (profiles.length === 0 && items.length === 0) && (
              <div className="text-center py-content-spacious text-muted-foreground">
                <div className="text-lg">{t('search.noResults') || 'No results found'}</div>
              </div>
            )}

            {profiles.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-base text-muted-foreground mb-4">
                  <User className="h-5 w-5" />
                  {t('search.users') || 'Users'}
                </h3>
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      onClick={() => handleUserClick(profile.id)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted cursor-pointer transition-colors card-3d"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.profile_image_url || ''} />
                        <AvatarFallback className="text-base">
                          {profile.name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base">
                          {profile.name || profile.username || 'Unknown User'}
                        </div>
                        {profile.specialties && profile.specialties.length > 0 && (
                          <div className="text-sm text-primary font-medium">
                            {profile.specialties.join(', ')}
                          </div>
                        )}
                        {profile.bio && (
                          <div className="text-sm text-muted-foreground truncate mt-1">
                            {profile.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {items.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-base text-muted-foreground mb-4">
                  <Package className="h-5 w-5" />
                  {t('search.items') || 'Items'}
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted cursor-pointer transition-colors card-3d"
                    >
                      <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base">{item.title}</div>
                        {item.category && (
                          <div className="text-sm text-primary font-medium">
                            {item.category}
                          </div>
                        )}
                        {item.price && (
                          <div className="text-sm text-muted-foreground">
                            ₪{item.price}
                          </div>
                        )}
                        {item.description && (
                          <div className="text-sm text-muted-foreground truncate mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SimplifiedModalBody>
      </SimplifiedModalContent>
    </SimplifiedModal>
  );
};

export default SearchPopup;