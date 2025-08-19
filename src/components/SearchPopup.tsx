import { useState, useEffect } from "react";
import { X, Search, User, Package, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchBar from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Profile {
  id: string;
  name: string;
  username: string;
  bio: string;
  profile_image_url: string;
  specialty: string;
  location: string;
}

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  location: string;
  user_id: string;
}

const SearchPopup = ({ isOpen, onClose }: SearchPopupProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
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
      // Search profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, username, bio, profile_image_url, specialty, location')
        .or(`name.ilike.%${query}%, username.ilike.%${query}%, bio.ilike.%${query}%, specialty.ilike.%${query}%`)
        .limit(10);

      // Search items
      const { data: itemsData } = await supabase
        .from('items')
        .select('id, title, description, price, category, image_url, location, user_id')
        .eq('status', 'active')
        .or(`title.ilike.%${query}%, description.ilike.%${query}%, category.ilike.%${query}%`)
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
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
    onClose();
  };

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mt-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-foreground">חיפוש</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="חפש משתמשים, פריטים, אירועים או התמחויות..."
            className="w-full"
          />
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {!loading && searchQuery && (profiles.length > 0 || items.length > 0) && (
            <div className="p-4 space-y-6">
              {/* Profiles Section */}
              {profiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    משתמשים ({profiles.length})
                  </h3>
                  <div className="space-y-3">
                    {profiles.map((profile) => (
                      <div
                        key={profile.id}
                        onClick={() => handleProfileClick(profile.id)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={profile.profile_image_url} />
                          <AvatarFallback>
                            {profile.name?.[0] || profile.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {profile.name || profile.username}
                          </h4>
                          {profile.specialty && (
                            <Badge variant="secondary" className="text-xs mb-1">
                              {profile.specialty}
                            </Badge>
                          )}
                          {profile.bio && (
                            <p className="text-sm text-muted-foreground truncate">
                              {profile.bio}
                            </p>
                          )}
                          {profile.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {profile.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Section */}
              {items.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    פריטים ({items.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className="bg-card border rounded-lg p-3 hover:shadow-md cursor-pointer transition-all"
                      >
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-32 object-cover rounded-md mb-2"
                          />
                        )}
                        <h4 className="font-medium text-foreground truncate">
                          {item.title}
                        </h4>
                        {item.price && (
                          <p className="text-primary font-semibold">
                            ₪{item.price.toLocaleString()}
                          </p>
                        )}
                        {item.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {item.category}
                          </Badge>
                        )}
                        {item.description && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {item.description}
                          </p>
                        )}
                        {item.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && searchQuery && profiles.length === 0 && items.length === 0 && (
            <div className="text-center p-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                לא נמצאו תוצאות
              </h3>
              <p className="text-muted-foreground">
                נסה לחפש במילות מפתח אחרות
              </p>
            </div>
          )}

          {!searchQuery && (
            <div className="text-center p-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                התחל לחפש
              </h3>
              <p className="text-muted-foreground">
                הקלד מילות מפתח למציאת משתמשים ופריטים
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;