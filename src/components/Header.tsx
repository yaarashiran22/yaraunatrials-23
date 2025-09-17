
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NeighborhoodIndicator from "@/components/NeighborhoodIndicator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Home, Settings, ChevronDown, Heart, Plus, MapPin, Search, Zap, MessageCircle, Sparkles } from "lucide-react";
import logoImage from "@/assets/reference-image.png";
import { useNewItem } from "@/contexts/NewItemContext";
import { useSearch } from "@/contexts/SearchContext";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onNeighborhoodChange?: (neighborhood: string) => void;
}

const Header = ({ 
  title, 
  showSearch = false, 
  searchValue = "", 
  onSearchChange, 
  searchPlaceholder,
  onNeighborhoodChange
}: HeaderProps) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { openNewItem } = useNewItem();
  const { openSearch } = useSearch();
  

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="header-bar border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center w-32">
            <div 
              className="title-section flex items-center gap-1 text-3xl cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={handleLogoClick}
              role="button"
              aria-label="Navigate to homepage"
              style={{ 
                color: 'hsl(var(--coral))', 
                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 700,
                textTransform: 'lowercase',
                letterSpacing: '-0.03em'
              }}
            >
              una
            </div>
          </div>
          
          {/* Center - Neighborhood Selector */}
          <div className="flex justify-center flex-1">
            <NeighborhoodSelector onNeighborhoodChange={onNeighborhoodChange} />
          </div>
          
          {/* Right side - Empty for now */}
          <div className="flex items-center gap-2 w-32 justify-end">
          </div>
          
        </div>
      </div>
      
    </header>
  );
};

export default Header;
