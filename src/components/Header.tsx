
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
    <header className="bg-transparent border-b border-white/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div 
            className="text-2xl font-black font-nunito cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" 
            style={{ 
              color: 'hsl(280 85% 75%)',
              textShadow: '0 0 10px rgba(187, 49, 233, 0.5)'
            }}
            onClick={handleLogoClick}
            role="button"
            aria-label="Navigate to homepage"
          >
            una
          </div>
          
          {/* Search Bar - Center */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search events, tags, or places"
                className="w-full px-4 py-2.5 pl-10 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
            </div>
          </div>
          
          {/* Location Switcher */}
          <div className="flex-shrink-0">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              📍 Buenos Aires
            </Button>
          </div>
          
          {/* Notifications */}
          {user && (
            <Button 
              variant="outline" 
              size="sm" 
              className="relative p-2.5 h-10 w-10 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-0 shadow-lg border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          )}
          
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
