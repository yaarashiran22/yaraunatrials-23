import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Bell, Plus, ChevronDown } from "lucide-react";
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
            {/* Create button */}
            <Button
              onClick={openNewItem}
              className="rounded-full px-6"
              style={{ backgroundColor: '#BB31E9', color: 'hsl(0 0% 100%)' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              צור פוסט
            </Button>
            
            {/* Notifications */}
            {onNotificationsClick && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onNotificationsClick}
                className="rounded-full w-10 h-10 p-0"
              >
                <Bell className="h-4 w-4" />
              </Button>
            )}
            
            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full px-4">
                    <User className="h-4 w-4 mr-2" />
                    {user.email?.split('@')[0] || 'משתמש'}
                    <ChevronDown className="h-4 w-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile/1')}>
                    <User className="h-4 w-4 mr-2" />
                    פרופיל
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <LogOut className="h-4 w-4 mr-2" />
                    הגדרות
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    התנתק
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="rounded-full"
              >
                התחבר
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;