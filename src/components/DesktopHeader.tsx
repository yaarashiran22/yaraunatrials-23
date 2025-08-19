import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Bell, Plus, ChevronDown, Settings } from "lucide-react";
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
    <header className="hidden lg:block bg-card border-b shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left section - Title or Search */}
          <div className="flex-1 max-w-lg">
            {showSearch && onSearchChange ? (
              <SearchBar 
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            ) : title ? (
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            ) : null}
          </div>
          
          {/* Center section - Selectors */}
          <div className="flex items-center gap-4">
            <NeighborhoodIndicator />
            <LanguageSelector />
          </div>
          
          {/* Right section - Actions and user */}
          <div className="flex items-center gap-3">
            {/* Add Item button (replacing notifications) */}
            <Button
              onClick={openNewItem}
              className="rounded-full w-9 h-9 p-0"
              style={{ backgroundColor: '#7B3F98', color: 'white', border: '2px solid #7B3F98' }}
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {/* User menu */}
            {user ? (
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
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="rounded-full"
              >
                {t('common.login')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;