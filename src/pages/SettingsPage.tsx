
import { User, Lock, HelpCircle, Mail, LogOut, MapPin, Globe, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import LanguageSelector from "@/components/LanguageSelector";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NotificationsPopup from "@/components/NotificationsPopup";
import { toast } from "sonner";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isUpdatingAccountType, setIsUpdatingAccountType] = useState(false);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  const handleAccountTypeChange = async (isBusiness: boolean) => {
    try {
      setIsUpdatingAccountType(true);
      const accountType = isBusiness ? 'business' : 'personal';
      await updateProfile({ account_type: accountType });
      toast.success(`Account updated to ${accountType} profile`);
    } catch (error) {
      console.error('Error updating account type:', error);
      toast.error("Failed to update account type");
    } finally {
      setIsUpdatingAccountType(false);
    }
  };

  const settingsOptions = [
    {
      icon: User,
      title: "My Profile",
      onClick: () => navigate('/profile/1')
    },
    {
      icon: Lock,
      title: "Privacy",
      onClick: () => console.log('Privacy settings')
    },
    {
      icon: HelpCircle,
      title: "Help & Contact",
      onClick: () => console.log('Contact info')
    },
    {
      icon: LogOut,
      title: "Logout",
      onClick: handleLogout
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20" dir="ltr">
      <Header 
        title="Settings"
        onNotificationsClick={() => setShowNotifications(true)}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Account Type Settings */}
        <div className="max-w-md mx-auto space-y-4 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Account Type
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Switch between personal and business account. Business accounts can create coupons.
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {profile?.account_type === 'business' ? (
                    <Building2 className="h-4 w-4 text-purple-600" />
                  ) : (
                    <Users className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-foreground font-medium">
                    {profile?.account_type === 'business' ? 'Business Account' : 'Personal Account'}
                  </span>
                </div>
              </div>
              <Switch
                checked={profile?.account_type === 'business'}
                onCheckedChange={handleAccountTypeChange}
                disabled={isUpdatingAccountType}
              />
            </div>
            
            {profile?.account_type === 'business' && (
              <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  ✨ Business features enabled: You can now create and manage coupons for your business.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Language and Location Settings */}
        <div className="max-w-md mx-auto space-y-4 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Language</span>
                </div>
                <LanguageSelector />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Neighborhood</span>
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
                <span className="mr-2">For questions and contact</span>
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
