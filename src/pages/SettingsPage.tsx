
import { ArrowRight, User, Lock, HelpCircle, Mail, LogOut, MapPin, Globe, Bell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import LanguageSelector from "@/components/LanguageSelector";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NotificationsPopup from "@/components/NotificationsPopup";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const settingsOptions = [
    {
      icon: User,
      title: "המשתמש שלי",
      onClick: () => navigate('/profile/1')
    },
    {
      icon: Lock,
      title: "פרטיות",
      onClick: () => console.log('Privacy settings')
    },
    {
      icon: HelpCircle,
      title: "מידע ויצירת קשר",
      onClick: () => console.log('Contact info')
    },
    {
      icon: LogOut,
      title: "התנתק",
      onClick: handleLogout
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <Header 
        title="הגדרות"
        onNotificationsClick={() => setShowNotifications(true)}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-foreground">הגדרות</h1>
        </div>

        {/* Language and Location Settings */}
        <div className="max-w-md mx-auto space-y-4 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">העדפות</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">שפה</span>
                </div>
                <LanguageSelector />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">שכונה</span>
                </div>
                <NeighborhoodSelector />
              </div>
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="max-w-md mx-auto space-y-4 mb-16">
          {settingsOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={index}
                variant="outline"
                onClick={option.onClick}
                className="w-full h-16 bg-card hover:bg-card/80 border border-border rounded-2xl flex items-center justify-between px-6 shadow-sm"
              >
                <IconComponent className="h-6 w-6 text-foreground" />
                <span className="text-lg font-medium text-foreground">{option.title}</span>
                <div className="w-6"></div> {/* Spacer for balance */}
              </Button>
            );
          })}
        </div>

        {/* Contact Email */}
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">yaara.shiran@gmail.com</span>
                <span className="mr-2">לציריג קשר שאלות</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <NotificationsPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <BottomNavigation />
    </div>
  );
};

export default SettingsPage;
