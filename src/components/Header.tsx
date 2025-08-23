
import LanguageSelector from "@/components/LanguageSelector";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NeighborhoodIndicator from "@/components/NeighborhoodIndicator";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Home, Settings, ChevronDown, Heart, Bell, Plus, Search } from "lucide-react";
import logoImage from "@/assets/reference-image.png";
import { useNewItem } from "@/contexts/NewItemContext";
import { useSearch } from "@/contexts/SearchContext";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationsPopup from "@/components/NotificationsPopup";
import { useState } from "react";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onNotificationsClick?: () => void;
}

const Header = ({ 
  title, 
  showSearch = false, 
  searchValue = "", 
  onSearchChange, 
  searchPlaceholder,
  onNotificationsClick
}: HeaderProps) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { openNewItem } = useNewItem();
  const { openSearch } = useSearch();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-transparent">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Search & Notifications Buttons - Left side */}
          {user && (
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="p-3 h-12 w-12 bg-card/80 border-border/40 hover:bg-card shadow-sm"
                onClick={openSearch}
              >
                <Search className="h-6 w-6" />
              </Button>
              
              {/* Notifications Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="relative p-3 h-12 w-12 bg-card/80 border-border/40 hover:bg-card shadow-sm"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-0 shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </div>
          )}
          
          {/* Neighborhood Selector or Search - Center */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4 min-w-0 flex justify-center">
            {showSearch && onSearchChange ? (
              <SearchBar 
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            ) : (
              <NeighborhoodIndicator />
            )}
          </div>

          {/* Logo and User Greeting - Right side */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Hello {user ? (user.email?.split('@')[0] || 'User') : 'Guest'}
              </span>
            </div>
            <div 
              className="text-2xl font-black font-nunito cursor-pointer hover:opacity-80 transition-opacity" 
              style={{ 
                color: 'hsl(280 85% 65%)'
              }}
              onClick={handleLogoClick}
              role="button"
              aria-label="Navigate to homepage"
            >
              una
            </div>
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
