
import { ArrowRight, User, Lock, HelpCircle, Mail, LogOut, MapPin, Globe, Bell, ArrowLeft, Plus, X, Heart, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [isUpdatingInterests, setIsUpdatingInterests] = useState(false);
  const [isUpdatingAccountType, setIsUpdatingAccountType] = useState(false);

  // Load interests from profile
  useEffect(() => {
    if (profile?.interests) {
      setInterests(profile.interests);
    }
  }, [profile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addInterest = async () => {
    if (!newInterest.trim()) return;
    
    const updatedInterests = [...interests, newInterest.trim()];
    setInterests(updatedInterests);
    setNewInterest("");
    
    try {
      setIsUpdatingInterests(true);
      await updateProfile({ interests: updatedInterests });
      toast.success("תחום עניין נוסף בהצלחה");
    } catch (error) {
      console.error('Error updating interests:', error);
      toast.error("שגיאה בהוספת תחום עניין");
      // Revert on error
      setInterests(interests);
    } finally {
      setIsUpdatingInterests(false);
    }
  };

  const removeInterest = async (index: number) => {
    const updatedInterests = interests.filter((_, i) => i !== index);
    setInterests(updatedInterests);
    
    try {
      setIsUpdatingInterests(true);
      await updateProfile({ interests: updatedInterests });
      toast.success("תחום עניין הוסר בהצלחה");
    } catch (error) {
      console.error('Error updating interests:', error);
      toast.error("שגיאה בהסרת תחום עניין");
      // Revert on error
      setInterests([...interests]);
    } finally {
      setIsUpdatingInterests(false);
    }
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
    <div className="min-h-screen bg-background pb-20" dir="ltr">
      <Header 
        title="הגדרות"
        onNotificationsClick={() => setShowNotifications(true)}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-foreground">הגדרות</h1>
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

        {/* Interests Settings */}
        <div className="max-w-md mx-auto space-y-4 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-muted-foreground" />
              תחומי עניין
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              הוספת תחומי עניין תעזור לנו להציע לך תוכן מותאם אישית
            </p>
            
            {/* Add new interest */}
            <div className="flex gap-2 mb-4">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="הוסף תחום עניין..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addInterest();
                  }
                }}
                disabled={isUpdatingInterests}
              />
              <Button 
                onClick={addInterest}
                size="sm"
                disabled={!newInterest.trim() || isUpdatingInterests}
                className="px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Display interests */}
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <div
                  key={index}
                  className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  <span>{interest}</span>
                  <button
                    onClick={() => removeInterest(index)}
                    disabled={isUpdatingInterests}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {interests.length === 0 && (
                <p className="text-muted-foreground text-sm">אין תחומי עניין עדיין</p>
              )}
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
