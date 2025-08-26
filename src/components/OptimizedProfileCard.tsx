import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OptimizedProfileCardProps {
  id: string;
  image: string;
  name: string;
  className?: string;
  style?: React.CSSProperties;
  isCurrentUser?: boolean;
}

const OptimizedProfileCard = memo(({ 
  id, 
  image, 
  name, 
  className = "", 
  style, 
  isCurrentUser = false 
}: OptimizedProfileCardProps) => {
  return (
    <div
      className={`flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
      style={style}
    >
      <div className="relative">
        <Avatar className="w-[66px] h-[66px] cursor-pointer border-2 border-purple-400/40 hover:border-purple-500/60 transition-all duration-200 shadow-lg shadow-purple-500/10">
          <AvatarImage 
            src={image} 
            alt={name} 
            className="object-cover"
            loading="lazy"
          />
          <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {isCurrentUser && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center">
            <span className="text-primary-foreground text-xs">+</span>
          </div>
        )}
      </div>
      
      <span className="text-xs font-medium text-center max-w-[70px] truncate text-foreground">
        {name}
      </span>
    </div>
  );
});

OptimizedProfileCard.displayName = 'OptimizedProfileCard';

export default OptimizedProfileCard;