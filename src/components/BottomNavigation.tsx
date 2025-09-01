import { Home, User, Users, Settings, LogIn, Plus, Heart, Search, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNewItem } from "@/contexts/NewItemContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    t,
    language,
    setLanguage
  } = useLanguage();
  const {
    user
  } = useAuth();
  const {
    openNewItem
  } = useNewItem();
  const languages = [{
    code: 'es',
    name: 'Español',
    flag: '🇦🇷'
  }, {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  }];
  const isActive = (path: string) => location.pathname === path;
  return <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg lg:hidden">
      <div className="container mx-auto px-2 py-2 max-w-full">
        <div className="flex items-center justify-around w-full">
          {/* Home - בית */}
          <Button variant="ghost" size="lg" onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 h-auto py-3 px-1 transition-all duration-200 hover-scale min-w-0 flex-1 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs font-medium truncate">{t('navigation.home')}</span>
          </Button>

          {/* Discover - גלה */}
          <Button variant="ghost" size="lg" onClick={() => navigate('/discover')} className={`flex flex-col items-center gap-1 h-auto py-3 px-1 transition-all duration-200 hover-scale min-w-0 flex-1 ${isActive('/discover') ? 'text-primary' : 'text-muted-foreground'}`}>
            <Map className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs font-medium truncate">Discover</span>
          </Button>

          {/* Profile/Login */}
          {user ? <Button variant="ghost" size="lg" onClick={() => navigate('/profile/1')} className={`flex flex-col items-center gap-1 h-auto py-3 px-1 transition-all duration-200 hover-scale min-w-0 flex-1 ${location.pathname.startsWith('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-medium truncate">{t('common.profile')}</span>
            </Button> : <Button variant="ghost" size="lg" onClick={() => navigate('/login')} className={`flex flex-col items-center gap-1 h-auto py-3 px-1 transition-all duration-200 hover-scale min-w-0 flex-1 ${isActive('/login') ? 'text-primary' : 'text-muted-foreground'}`}>
              <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-medium truncate">{t('common.login')}</span>
            </Button>}
        </div>
      </div>
    </nav>;
};
export default BottomNavigation;