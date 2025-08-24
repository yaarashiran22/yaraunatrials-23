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
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div 
            className="text-2xl font-black font-nunito cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 text-primary" 
            onClick={() => navigate('/')}
            role="button"
            aria-label="Navigate to homepage"
          >
            una
          </div>
          
          {/* Search Bar - Center */}
          <div className="flex-1 max-w-lg">
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
                  className="w-full px-4 py-2.5 pl-10 rounded-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Location Switcher */}
          <div className="flex-shrink-0">
            <Button 
              variant="outline" 
              className="bg-accent text-accent-foreground hover:bg-accent/80"
            >
              📍 Buenos Aires
            </Button>
          </div>
          
          {/* Notifications */}
          {user && (
            <Button 
              variant="outline" 
              size="sm" 
              className="relative p-2.5 h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/80"
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full px-4">
                  <User className="h-4 w-4 mr-2" />
                  {user.email?.split('@')[0] || t('common.profile')}
                  <ChevronDown className="h-4 w-4 mr-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/profile/1')}>
                  <User className="h-4 w-4 mr-2" />
                  {t('common.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  {t('common.settings')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('common.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;