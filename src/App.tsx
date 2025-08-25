import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Home, User, Users, Settings, Heart } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { NewItemProvider } from "@/contexts/NewItemContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { SearchProvider } from "@/contexts/SearchContext";
import SearchPopup from "@/components/SearchPopup";

import ProtectedRoute from "@/components/ProtectedRoute";
import NewItemPopup from "@/components/NewItemPopup";
import { useNewItem } from "@/contexts/NewItemContext";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import ArtistsPage from "./pages/ArtistsPage";
import FeedPage from "./pages/FeedPage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import ItemDetailsPage from "./pages/ItemDetailsPage";
import ArtistDetailsPage from "./pages/ArtistDetailsPage";
import RecommendedPage from "./pages/RecommendedPage";
import MarketplacePage from "./pages/MarketplacePage";
import ArtistsCreatorsPage from "./pages/ArtistsCreatorsPage";
import NeighborhoodProfilePage from "./pages/NeighborhoodProfilePage";
import NeighborsPage from "./pages/NeighborsPage";
import AllEventsPage from "./pages/AllEventsPage";
import AllRecommendationsPage from "./pages/AllRecommendationsPage";

import CommunitiesPage from "./pages/CommunitiesPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";
import NewItemPage from "./pages/NewItemPage";
import CreatePostPage from "./pages/CreatePostPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditProfilePage from "./pages/EditProfilePage";
import EditItemPage from "./pages/EditItemPage";
import NotFound from "./pages/NotFound";



// Desktop navigation item component
const DesktopNavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === href || (href === '/profile/1' && location.pathname.startsWith('/profile'));
  
  return (
    <button
      onClick={() => navigate(href)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
        isActive 
          ? 'bg-primary/10 text-primary border border-primary/20' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

const AppContent = () => {
  const { isOpen, closeNewItem, refreshItems } = useNewItem();
  const { t } = useLanguage();
  
  return (
    <BrowserRouter>
      {/* Desktop and mobile responsive layout */}
      <div className="min-h-screen w-full">
        {/* Desktop layout - hidden on mobile */}
        <div className="hidden lg:flex w-full min-h-screen">
          {/* Main content area for desktop */}
          <div className="flex-1 ml-64">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<Index />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/items/:itemId/edit" element={<EditItemPage />} />
              <Route path="/artists" element={<ArtistsPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/all-events" element={<AllEventsPage />} />
              <Route path="/all-recommendations" element={<AllRecommendationsPage />} />
              <Route path="/event/:id" element={<EventDetailsPage />} />
              <Route path="/item/:id" element={<ItemDetailsPage />} />
              <Route path="/artist/:id" element={<ArtistDetailsPage />} />
              <Route path="/recommended" element={<RecommendedPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/artists-creators" element={<ArtistsCreatorsPage />} />
              <Route path="/neighbors" element={<NeighborsPage />} />
              <Route path="/neighborhood/:id" element={<NeighborhoodProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/new-item" element={<NewItemPage />} />
              <Route path="/create-post" element={<CreatePostPage />} />
              <Route path="/create-event" element={<CreateEventPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          
          {/* Left sidebar for desktop navigation */}
          <div className="w-64 bg-card border-r shadow-sm fixed left-0 top-0 h-full overflow-y-auto">
            <div className="p-6">
              <div 
              className="text-3xl font-black font-nunito cursor-pointer hover:opacity-80 transition-opacity mb-8 text-primary"
                onClick={() => window.location.href = '/'}
                role="button"
                aria-label="Navigate to homepage"
              >
                una
              </div>
              <nav className="space-y-2">
                <DesktopNavItem href="/" icon={Home} label={t('common.home')} />
                <DesktopNavItem href="/feed" icon={Users} label={t('feed.title')} />
                <DesktopNavItem href="/profile/1" icon={User} label={t('common.profile')} />
                <DesktopNavItem href="/settings" icon={Settings} label={t('common.settings')} />
              </nav>
            </div>
          </div>
        </div>
        
        {/* Mobile layout - hidden on desktop */}
        <div className="lg:hidden w-full min-h-screen">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Index />} />
            <Route path="/communities" element={<CommunitiesPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/items/:itemId/edit" element={<EditItemPage />} />
            <Route path="/artists" element={<ArtistsPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/all-events" element={<AllEventsPage />} />
            <Route path="/all-recommendations" element={<AllRecommendationsPage />} />
            <Route path="/event/:id" element={<EventDetailsPage />} />
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/artist/:id" element={<ArtistDetailsPage />} />
            <Route path="/recommended" element={<RecommendedPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/artists-creators" element={<ArtistsCreatorsPage />} />
            <Route path="/neighbors" element={<NeighborsPage />} />
            <Route path="/neighborhood/:id" element={<NeighborhoodProfilePage />} />
            
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/new-item" element={<NewItemPage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
      
      <NewItemPopup isOpen={isOpen} onClose={closeNewItem} onItemCreated={refreshItems} />
      <SearchPopup />
    </BrowserRouter>
  );
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <LanguageProvider>
      <AuthProvider>
        <NewItemProvider>
          <FavoritesProvider>
            <SearchProvider>
              <AppContent />
            </SearchProvider>
          </FavoritesProvider>
        </NewItemProvider>
      </AuthProvider>
    </LanguageProvider>
  </TooltipProvider>
);

export default App;