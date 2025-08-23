
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import React from "react";

interface UniformCardProps {
  id?: string;
  image: string;
  title: string | React.ReactNode;
  subtitle?: string;
  price?: string;
  date?: string; // Add date field
  isLiked?: boolean;
  type: 'business' | 'marketplace' | 'event' | 'item' | 'artwork';
  onClick?: () => void;
  altText?: string; // For image alt text when title is ReactNode
  favoriteData?: any; // Complete data for favorites
  uploader?: {
    name: string;
    image: string;
    small_photo: string;
    location: string;
    user_id?: string;
  };
  showFavoriteButton?: boolean; // Control whether to show the favorite button
  onProfileClick?: (userId: string) => void; // Handler for profile navigation
}

const UniformCard = ({ 
  id = Math.random().toString(), 
  image, 
  title, 
  subtitle, 
  price, 
  date,
  isLiked = false, 
  type, 
  onClick, 
  altText,
  favoriteData,
  uploader,
  showFavoriteButton = true,
  onProfileClick
}: UniformCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // Check favorites context for all items
  const isCurrentlyFavorited = isFavorite(id, type);
  
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Handle all items using favorites context
    if (favoriteData) {
      const favoriteItem = {
        id: id,
        type: type as 'business' | 'event',
        title: typeof title === 'string' ? title : 'Item',
        subtitle: subtitle,
        image: image,
        price: price,
        data: favoriteData
      };
      toggleFavorite(favoriteItem);
    }
  };

  // Extract string from title for alt text
  const getAltText = () => {
    if (altText) return altText;
    if (typeof title === 'string') return title;
    return 'Card image';
  };

  return (
    <div 
      className="relative bg-card rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 group w-full cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={getAltText()}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-3 h-16 flex flex-col justify-between">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground truncate text-sm">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
            {date && (
              <p className="text-xs text-muted-foreground/80 truncate mt-0.5">{date}</p>
            )}
          </div>
          {/* Display uploader profile image for events and recommendations */}
          {(type === 'event' || type === 'business') && uploader && (
            <div 
              className="cursor-pointer flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                if (onProfileClick && uploader.user_id) {
                  onProfileClick(uploader.user_id);
                }
              }}
            >
              <img 
                src={uploader.small_photo}
                alt={uploader.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-white/80 shadow-sm hover:ring-2 hover:ring-primary/50 transition-all"
                onError={(e) => {
                  e.currentTarget.src = uploader.image;
                }}
              />
            </div>
          )}
          {/* Save button moved to bottom */}
          {showFavoriteButton && (type === 'marketplace' || type === 'artwork' || type === 'business' || type === 'event') && (
            <Button
              variant="ghost"
              size="sm"
              className={`p-1.5 rounded-full ${
                isCurrentlyFavorited ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={handleFavoriteClick}
            >
              <Bookmark className={`h-4 w-4 ${isCurrentlyFavorited ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
        {price && (
          <p className="text-sm font-bold text-primary">{price}</p>
        )}
      </div>
    </div>
  );
};

export default UniformCard;
