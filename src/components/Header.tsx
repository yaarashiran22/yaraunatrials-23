
import LanguageSelector from "@/components/LanguageSelector";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NeighborhoodIndicator from "@/components/NeighborhoodIndicator";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Home, Settings, ChevronDown, Heart, Bell, Plus } from "lucide-react";
import logoImage from "@/assets/reference-image.png";
import { useNewItem } from "@/contexts/NewItemContext";
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
          {/* Notifications Button - Left side */}
          {user && (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative p-2 h-10 w-10"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-0">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Logo and User Greeting - Center */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                שלום {user ? (user.email?.split('@')[0] || 'משתמש') : 'אורח'}
              </span>
            </div>
          </div>
          
          {/* Neighborhood Selector or Search - Right side */}
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
