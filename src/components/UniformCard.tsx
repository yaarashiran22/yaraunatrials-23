
import { Heart, MapPin } from "lucide-react";
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
  date?: string;
  isLiked?: boolean;
  type: 'business' | 'marketplace' | 'event' | 'item' | 'artwork';
  onClick?: () => void;
  altText?: string;
  favoriteData?: any;
  uploader?: {
    id?: string;
    name: string;
    image?: string;
    small_photo?: string;
    location?: string;
    user_id?: string;
  };
  showFavoriteButton?: boolean;
  onProfileClick?: (userId: string) => void;
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
  const getAltText = (type: string, title: string | React.ReactNode) => {
    if (altText) return altText;
    if (typeof title === 'string') return `${type} - ${title}`;
    return `${type} card image`;
  };

  return (
    <div 
      className={`
        relative group cursor-pointer bg-card border border-border/40 rounded-2xl overflow-hidden 
        shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 
        hover:border-primary/30 backdrop-blur-sm bg-gradient-to-br from-card/95 to-card/80
        hover:bg-gradient-to-br hover:from-card hover:to-accent/10
      `}
      onClick={onClick}
      style={{
        width: 'fit-content',
        maxWidth: '380px',
        minWidth: '300px'
      }}
    >
      {/* Image/Video Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
        {video ? (
          <video 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            autoPlay 
            muted 
            loop 
            playsInline
            poster={image}
            onLoadedData={(e) => {
              e.currentTarget.play().catch(() => {
                console.log('Autoplay blocked, video will play on user interaction');
              });
            }}
          >
            <source src={video} type="video/mp4" />
          </video>
        ) : (
          <img 
            src={image || '/placeholder.svg'} 
            alt={getAltText(type, title)} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop';
            }}
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Enhanced shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-out"></div>
        
        {/* Favorite Button */}
        {showFavoriteButton && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFavoriteClick}
              className={`
                h-10 w-10 rounded-full p-0 backdrop-blur-md transition-all duration-300 border shadow-lg
                hover:scale-110 active:scale-95
                ${isCurrentlyFavorited 
                  ? 'bg-red-500/90 hover:bg-red-600 text-white border-red-400/30 shadow-red-500/25' 
                  : 'bg-white/20 hover:bg-white/30 text-white hover:text-red-400 border-white/30'
                }
              `}
            >
              <Heart className={`h-5 w-5 transition-all duration-300 ${isCurrentlyFavorited ? 'fill-current animate-pulse' : ''}`} />
            </Button>
          </div>
        )}

        {/* Price/Date Badge */}
        {(price || date) && (
          <div className="absolute top-4 left-4">
            <div className="bg-black/70 backdrop-blur-md text-white px-3 py-2 rounded-full text-sm font-semibold border border-white/20 shadow-xl">
              {price && price !== 'Free' ? `₪${price}` : date || 'Free'}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title and Subtitle */}
        <div className="space-y-2">
          <h3 className="font-bold text-foreground text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {typeof title === 'string' ? title : title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground line-clamp-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
              {subtitle}
            </p>
          )}
        </div>

        {/* Uploader Info */}
        {uploader && (
          <div className="flex items-center gap-3 pt-3 border-t border-border/30">
            <div 
              className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity group"
              onClick={(e) => {
                e.stopPropagation();
                onProfileClick?.(uploader.id || uploader.user_id || '');
              }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shadow-md">
                {uploader.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-foreground font-semibold group-hover:text-primary transition-colors">
                  {uploader.name || 'User'}
                </span>
                {uploader.location && (
                  <p className="text-xs text-muted-foreground">
                    {uploader.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniformCard;
