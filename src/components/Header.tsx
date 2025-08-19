
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
          {/* Logo and User Greeting - Right side */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div 
              className="text-2xl font-black font-nunito cursor-pointer hover:opacity-80 transition-opacity" 
              style={{ 
                color: 'hsl(280 60% 75%)'
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
          
          {/* Add Item button - Right side */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <Button 
              onClick={openNewItem} 
              size="sm" 
              variant="ghost"
              className="h-9 w-9 rounded-full p-0 hover:bg-muted/20"
              aria-label="Add new item"
            >
              <Plus className="h-4 w-4" style={{ color: '#BB31E9' }} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
