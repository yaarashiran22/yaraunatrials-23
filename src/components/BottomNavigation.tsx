
import { Home, User, Users, Settings, LogIn, Plus, Heart, Search, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNewItem } from "@/contexts/NewItemContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { openNewItem } = useNewItem();

  const languages = [
    { code: 'es', name: 'Español', flag: '🇦🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 lg:hidden shadow-large safe-area-inset-bottom">
      <div className="px-4 py-3">
        <div className="flex items-center justify-around w-full max-w-sm mx-auto">
          {/* Home - בית */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className={`flex flex-col items-center gap-1.5 h-auto py-3 px-4 transition-all duration-200 rounded-2xl min-h-[3rem] ${
              isActive('/') 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">{t('navigation.home')}</span>
          </Button>

          {/* Discover - גלה */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/discover')}
            className={`flex flex-col items-center gap-1.5 h-auto py-3 px-4 transition-all duration-200 rounded-2xl min-h-[3rem] ${
              isActive('/discover') 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Map className="h-6 w-6" />
            <span className="text-xs font-medium">Hangout</span>
          </Button>

          {/* Profile/Login */}
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile/1')}
              className={`flex flex-col items-center gap-1.5 h-auto py-3 px-4 transition-all duration-200 rounded-2xl min-h-[3rem] ${
                location.pathname.startsWith('/profile') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <User className="h-6 w-6" />
              <span className="text-xs font-medium">{t('common.profile')}</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="flex flex-col items-center gap-1.5 h-auto py-3 px-4 transition-all duration-200 rounded-2xl min-h-[3rem] text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <LogIn className="h-6 w-6" />
              <span className="text-xs font-medium">{t('common.login')}</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
