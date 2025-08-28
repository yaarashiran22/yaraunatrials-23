import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Bell, Plus, ChevronDown, Settings, Search } from "lucide-react";
import { useNewItem } from "@/contexts/NewItemContext";
import LanguageSelector from "@/components/LanguageSelector";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NeighborhoodIndicator from "@/components/NeighborhoodIndicator";
import SearchBar from "@/components/SearchBar";

interface DesktopHeaderProps {
  title?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onNotificationsClick?: () => void;
}

const DesktopHeader = ({ 
  title, 
  showSearch = false, 
  searchValue = "", 
  onSearchChange, 
  searchPlaceholder,
  onNotificationsClick
}: DesktopHeaderProps) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { openNewItem } = useNewItem();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="hidden lg:block bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-8 py-6">
        <div className="flex items-center justify-between gap-8">
          {/* Left section - Logo */}
          <div className="flex-shrink-0">
            <div 
              className="text-3xl font-black font-nunito cursor-pointer hover:opacity-80 transition-opacity text-primary" 
              onClick={() => navigate('/')}
              role="button"
              aria-label="Navigate to homepage"
            >
              una
            </div>
          </div>
          
          {/* Center section - Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            {showSearch && onSearchChange ? (
              <SearchBar 
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            ) : (
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search events, tags, or places"
                  className="w-full px-5 py-3 pl-12 rounded-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Right section - Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Location Switcher */}
            <Button 
              variant="outline" 
              className="bg-accent text-accent-foreground hover:bg-accent/80 px-4 py-2 h-11"
            >
              📍 Buenos Aires
            </Button>
            
            {/* Notifications */}
            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                className="relative p-3 h-11 w-11 bg-primary text-primary-foreground hover:bg-primary/80"
                onClick={() => {/* Add notification handler */}}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-0 shadow-lg border-2 border-background">
                  3
                </span>
              </Button>
            )}
            
            {/* User menu */}
            {user && (
              <Button 
                variant="outline" 
                className="rounded-full px-5 py-2 h-11"
                onClick={() => navigate('/profile/1')}
              >
                <User className="h-4 w-4 mr-2" />
                {user.email?.split('@')[0] || t('common.profile')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;