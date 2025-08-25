
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import React from "react";

interface UniformCardProps {
  id?: string;
  image?: string;
  video?: string;
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
  video,
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
      className="relative card-elevated rounded-xl overflow-hidden group w-full cursor-pointer hover:glow-accent transition-all duration-500"
      onClick={onClick}
    >
      <div className="aspect-[3.5/2.8] overflow-hidden relative">
        {video ? (
          <video 
            src={video} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            muted
            autoPlay
            loop
            playsInline
            onError={(e) => {
              // If video fails to load, hide the video element
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <img 
            src={image || '/placeholder.svg'} 
            alt={getAltText()}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300"></div>
        
        {/* Heart icon positioned over image */}
        {showFavoriteButton && (type === 'marketplace' || type === 'artwork' || type === 'business' || type === 'event') && (
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 ${
              isCurrentlyFavorited ? 'text-red-500' : 'text-white hover:text-red-400'
            }`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`h-4 w-4 ${isCurrentlyFavorited ? 'fill-current' : ''}`} />
          </Button>
        )}
      </div>
      
      <div className="p-3 min-h-[80px] flex flex-col justify-between surface-elevated">
        <div className="flex items-start gap-2">
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-tight">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground line-clamp-1">{subtitle}</p>
            )}
            {date && (
              <p className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full inline-block">{date}</p>
            )}
            {price && (
              <p className="text-xs text-green-600 font-semibold bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full inline-block mt-1 ml-2">${price}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniformCard;
