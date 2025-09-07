
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
      className="relative group w-full cursor-pointer transform transition-all duration-300 hover:scale-[1.03] hover:z-10"
      onClick={onClick}
    >
      {/* Card container with enhanced visual effects */}
      <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20 shadow-lg hover:shadow-2xl hover:border-white/30 transition-all duration-500">
        
        {/* Image/Video container */}
        <div className="aspect-[3.5/3.5] overflow-hidden relative">
          {video ? (
            <video 
              src={video} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
              poster={image}
              onLoadedData={(e) => {
                e.currentTarget.play().catch(() => {
                  console.log('Autoplay blocked, video will play on user interaction');
                });
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                console.log('Video failed to load:', video);
              }}
            />
          ) : (
            <img 
              src={image || '/placeholder.svg'} 
              alt={getAltText()}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          )}
          
          {/* Enhanced shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
          
          {/* Enhanced text overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-0 group-hover:translate-y-[-2px] transition-transform duration-300">
            <div className="space-y-2">
              <h3 className="font-bold text-white line-clamp-2 text-base leading-tight drop-shadow-xl">{title}</h3>
              {subtitle && (
                <p className="text-sm text-white/95 line-clamp-1 drop-shadow-lg font-medium">{subtitle}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {date && (
                  <span className="text-xs font-bold px-3 py-1.5 bg-white/25 backdrop-blur-md rounded-full text-white border border-white/40 shadow-lg">{date}</span>
                )}
                {price && (
                  <span className="text-xs font-bold px-3 py-1.5 bg-primary/90 backdrop-blur-md rounded-full text-white border border-white/40 shadow-lg">${price}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced heart button with better positioning and effects */}
          {showFavoriteButton && (type === 'marketplace' || type === 'artwork' || type === 'business' || type === 'event') && (
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md bg-white/25 hover:bg-white/35 border border-white/40 hover:border-white/60 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 ${
                isCurrentlyFavorited ? 'text-red-500 bg-white/35' : 'text-white hover:text-red-400'
              }`}
              onClick={handleFavoriteClick}
            >
              <Heart className={`h-4 w-4 ${isCurrentlyFavorited ? 'fill-current' : ''} transition-all duration-200`} />
            </Button>
          )}
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-3xl ring-1 ring-white/20 group-hover:ring-2 group-hover:ring-white/40 transition-all duration-300 pointer-events-none"></div>
        </div>
        
        {/* Bottom reflection effect */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Subtle drop shadow enhancement */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none transform translate-y-1"></div>
    </div>
  );
};

export default UniformCard;
