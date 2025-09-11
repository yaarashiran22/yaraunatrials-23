
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
      className="relative card-elevated rounded-3xl overflow-hidden group w-full cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20"
      onClick={onClick}
      style={{
        transform: 'perspective(1000px)',
        transformStyle: 'preserve-3d',
        minWidth: '240px',
        width: '240px'
      }}
    >
      <div className="aspect-[4/5] overflow-hidden relative rounded-3xl">
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
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-out"></div>
        
        {/* Subtle glow border on hover */}
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-primary/30 transition-all duration-500"></div>
        
        {/* Enhanced text overlay - smaller to show more image */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 transform translate-y-0 group-hover:translate-y-[-2px] transition-transform duration-300">
          <div className="space-y-1">
            <h3 className="font-semibold text-white line-clamp-1 text-sm leading-tight drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300">{title}</h3>
            {subtitle && (
              <p className="text-xs text-white/80 line-clamp-1 drop-shadow-md transform translate-y-0 group-hover:translate-y-[-1px] transition-transform duration-300">{subtitle}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              {date && (
                <span className="text-xs font-medium px-2 py-0.5 bg-orange-500 backdrop-blur-md rounded-full text-white border border-orange-500 shadow-lg transition-all duration-300 group-hover:bg-orange-600 group-hover:scale-105">{date}</span>
              )}
              {(price || (type === 'event')) && (
                <span className="text-xs font-medium px-2 py-0.5 bg-primary/90 backdrop-blur-md rounded-full text-white border border-white/40 shadow-lg transition-all duration-300 group-hover:bg-primary group-hover:scale-105">
                  {price ? `$${price}` : 'free'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced heart icon with animation */}
        {showFavoriteButton && (type === 'marketplace' || type === 'artwork' || type === 'business' || type === 'event') && (
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 border shadow-lg hover:scale-110 active:scale-95 ${
              isCurrentlyFavorited 
                ? 'text-red-500 bg-white/90 border-red-200 hover:bg-white shadow-red-200/50' 
                : 'text-white bg-white/20 border-white/30 hover:bg-white/30 hover:text-red-400'
            }`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`h-4 w-4 transition-all duration-300 ${isCurrentlyFavorited ? 'fill-current animate-pulse' : ''}`} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default UniformCard;
