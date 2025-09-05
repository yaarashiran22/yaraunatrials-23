
import LanguageSelector from "@/components/LanguageSelector";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NeighborhoodIndicator from "@/components/NeighborhoodIndicator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Home, Settings, ChevronDown, Heart, Bell, Plus, Sparkles, MapPin, MessageCircle } from "lucide-react";
import logoImage from "@/assets/reference-image.png";
import { useNewItem } from "@/contexts/NewItemContext";
import { useOptimizedNotifications } from "@/hooks/useOptimizedQueries";
import NotificationsPopup from "@/components/NotificationsPopup";
import AIAssistantPopup from "@/components/AIAssistantPopup";
import { useState } from "react";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onNotificationsClick?: () => void;
  onNeighborhoodChange?: (neighborhood: string) => void;
}

const Header = ({ 
  title, 
  showSearch = false, 
  searchValue = "", 
  onSearchChange, 
  searchPlaceholder,
  onNotificationsClick,
  onNeighborhoodChange
}: HeaderProps) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { openNewItem } = useNewItem();
  const { data: notificationData } = useOptimizedNotifications(user?.id);
  const unreadCount = notificationData?.unreadCount || 0;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

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
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div 
            className="title-section text-3xl cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 text-primary" 
            onClick={handleLogoClick}
            role="button"
            aria-label="Navigate to homepage"
            style={{ textTransform: 'none', color: 'hsl(var(--primary))' }}
          >
            una
          </div>
          
          {/* Neighborhood Selector */}
          <div className="flex-1 flex justify-center">
            <NeighborhoodSelector onNeighborhoodChange={onNeighborhoodChange} />
          </div>
          
          {/* Messages and Notifications */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="p-2.5 h-10 w-10 bg-white text-foreground hover:bg-gray-50 border border-black shadow-sm rounded-full"
              onClick={() => navigate('/messages')}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            
            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                className="relative p-2.5 h-10 w-10 bg-black text-white hover:bg-gray-800 border-black rounded-full"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-0 shadow-lg border-2 border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
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
