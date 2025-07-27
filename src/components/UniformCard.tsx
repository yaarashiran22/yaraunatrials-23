
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import React from "react";

interface UniformCardProps {
  id?: string;
  image: string;
  title: string | React.ReactNode;
  subtitle?: string;
  price?: string;
  isLiked?: boolean;
  type: 'business' | 'marketplace' | 'event' | 'item' | 'artwork';
  onClick?: () => void;
  altText?: string; // For image alt text when title is ReactNode
  favoriteData?: any; // Complete data for favorites
  userProfile?: {
    name: string;
    profile_image_url: string;
  } | null | any;
}

const UniformCard = ({ 
  id = Math.random().toString(), 
  image, 
  title, 
  subtitle, 
  price, 
  isLiked = false, 
  type, 
  onClick, 
  altText,
  favoriteData,
  userProfile
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
      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={image} 
          alt={getAltText()}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {userProfile && userProfile.name && !userProfile.error && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
            <img 
              src={userProfile.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"} 
              alt={userProfile.name}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="text-white text-xs font-medium truncate max-w-16">
              {userProfile.name}
            </span>
          </div>
        )}
      </div>
      
      {(type === 'marketplace' || type === 'artwork' || type === 'business' || type === 'event') && (
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 left-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm ${
            isCurrentlyFavorited ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
          }`}
          onClick={handleFavoriteClick}
        >
          <Heart className={`h-4 w-4 ${isCurrentlyFavorited ? 'fill-current' : ''}`} />
        </Button>
      )}
      
      <div className="p-3 h-20 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-foreground truncate text-sm">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
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
