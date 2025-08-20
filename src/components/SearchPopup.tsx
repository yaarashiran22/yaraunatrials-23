import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    <Dialog open={isSearchOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('common.search')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Input
            placeholder="Search for users, items, events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {!loading && searchQuery && (profiles.length === 0 && items.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              {t('search.noResults') || 'No results found'}
            </div>
          )}

          {profiles.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-sm text-muted-foreground mb-3">
                <User className="h-4 w-4" />
                {t('search.users') || 'Users'}
              </h3>
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    onClick={() => handleUserClick(profile.id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.profile_image_url || ''} />
                      <AvatarFallback>
                        {profile.name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {profile.name || profile.username || 'Unknown User'}
                      </div>
                      {profile.specialties && profile.specialties.length > 0 && (
                        <div className="text-xs text-primary font-medium">
                          {profile.specialties.join(', ')}
                        </div>
                      )}
                      {profile.bio && (
                        <div className="text-xs text-muted-foreground truncate">
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
              <h3 className="flex items-center gap-2 font-semibold text-sm text-muted-foreground mb-3">
                <Package className="h-4 w-4" />
                {t('search.items') || 'Items'}
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
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
                      <div className="font-medium text-sm">{item.title}</div>
                      {item.category && (
                        <div className="text-xs text-primary font-medium">
                          {item.category}
                        </div>
                      )}
                      {item.price && (
                        <div className="text-xs text-muted-foreground">
                          ₪{item.price}
                        </div>
                      )}
                      {item.description && (
                        <div className="text-xs text-muted-foreground truncate">
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
      </DialogContent>
    </Dialog>
  );
};

export default SearchPopup;