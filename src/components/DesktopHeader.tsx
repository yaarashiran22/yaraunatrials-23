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
    <header className="hidden lg:block bg-transparent border-b border-white/10 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div 
            className="text-2xl font-black font-nunito cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" 
            style={{ 
              color: 'hsl(280 85% 75%)',
              textShadow: '0 0 10px rgba(187, 49, 233, 0.5)'
            }}
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
                  className="w-full px-4 py-2.5 pl-10 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
              </div>
            )}
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
              onClick={() => {/* Add notification handler */}}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-0 shadow-lg border-2 border-white">
                3
              </span>
            </Button>
          )}
          
          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full px-4 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
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