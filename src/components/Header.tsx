
import LanguageSelector from "@/components/LanguageSelector";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NeighborhoodIndicator from "@/components/NeighborhoodIndicator";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Home, Settings, ChevronDown, Heart, Bell, Plus, Search, MapPin } from "lucide-react";
import logoImage from "@/assets/reference-image.png";
import { useNewItem } from "@/contexts/NewItemContext";
import { useSearch } from "@/contexts/SearchContext";
import { useOptimizedNotifications } from "@/hooks/useOptimizedQueries";
import NotificationsPopup from "@/components/NotificationsPopup";
import { useState } from "react";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onNotificationsClick?: () => void;
  onNeighborhoodChange?: (neighborhood: string) => void;
}

const Header = ({ 
  title, 
  showSearch = false, 
  searchValue = "", 
  onSearchChange, 
  searchPlaceholder,
  onNotificationsClick,
  onNeighborhoodChange
}: HeaderProps) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { openNewItem } = useNewItem();
  const { openSearch } = useSearch();
  const { data: notificationData } = useOptimizedNotifications(user?.id);
  const unreadCount = notificationData?.unreadCount || 0;
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div 
            className="text-2xl font-black font-nunito cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 text-primary" 
            onClick={handleLogoClick}
            role="button"
            aria-label="Navigate to homepage"
          >
            una
          </div>
          
          {/* Neighborhood Selector */}
          <div className="flex-1 flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 border-accent">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Palermo</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-background border shadow-lg z-50 min-w-[200px]">
                <DropdownMenuItem className="cursor-pointer hover:bg-accent/10">
                  <MapPin className="h-4 w-4 mr-2 text-accent" />
                  <span>Palermo</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent/10">
                  <MapPin className="h-4 w-4 mr-2 text-accent" />
                  <span>Palermo Soho</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent/10">
                  <MapPin className="h-4 w-4 mr-2 text-accent" />
                  <span>Palermo Hollywood</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent/10">
                  <MapPin className="h-4 w-4 mr-2 text-accent" />
                  <span>Palermo Chico</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent/10">
                  <MapPin className="h-4 w-4 mr-2 text-accent" />
                  <span>Las Cañitas</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent/10">
                  <MapPin className="h-4 w-4 mr-2 text-accent" />
                  <span>Villa Crespo</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Search and Notifications */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="p-2.5 h-10 w-10 bg-background text-foreground hover:bg-accent border-border"
              onClick={openSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                className="relative p-2.5 h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/80"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-0 shadow-lg border-2 border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            )}
          </div>
          
        </div>
      </div>
      
      {/* Notifications Popup */}
      <NotificationsPopup 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
};

export default Header;
