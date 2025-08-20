import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Bell, Camera, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import BottomNavigation from "@/components/BottomNavigation";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import NotificationsPopup from "@/components/NotificationsPopup";
import profile1 from "@/assets/profile-1.jpg";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateProfile, uploadProfileImage } = useProfile();
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileImage, setProfileImage] = useState(profile1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
    specialties: [],
    interests: ['צילום', 'יוצר תוכן', 'אמנות', 'מוזיקה'],
    isPrivate: false,
    showInSearch: true
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "משתמש לא מחובר",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let profileImageUrl = null;

      // Upload image if a new one was selected
      if (selectedImageFile) {
        profileImageUrl = await uploadProfileImage(selectedImageFile);
      }

      // Prepare update data
      const updateData: any = {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        specialties: formData.specialties,
        interests: formData.interests,
        is_private: formData.isPrivate,
        show_in_search: formData.showInSearch,
      };

      // Only include profile_image_url if a new image was uploaded
      if (profileImageUrl) {
        updateData.profile_image_url = profileImageUrl;
      }

      await updateProfile(updateData);
      
      toast({
        title: "השינויים נשמרו בהצלחה",
        description: "הפרופיל שלך עודכן",
      });
      
      // Navigate back after successful save
      navigate(-1);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "שגיאה בשמירת השינויים",
        description: error.message || "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing profile data on component mount
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
        specialties: profile.specialties || [],
        interests: profile.interests || ['צילום', 'יוצר תוכן', 'אמנות', 'מוזיקה'],
        isPrivate: profile.is_private || false,
        showInSearch: profile.show_in_search !== false // Default to true if null/undefined
      });

      if (profile.profile_image_url) {
        setProfileImage(profile.profile_image_url);
      }
    }
  }, [profile]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div></div> {/* Empty div for spacing */}
        <h2 className="text-lg font-semibold">עריכת פרופיל</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate(user ? `/profile/${user.id}` : '/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <main className="px-4 py-6 pb-20">
        {/* Page content starts here - title removed since it's now in header */}

        {/* Profile Picture Section */}
        <div className="flex justify-center mb-8 mt-6">
          <div className="relative">
            <img 
              src={profileImage}
              alt="תמונת פרופיל"
              className="rounded-full object-cover"
              style={{ width: '100px', height: '100px' }}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-background border-2 hover:bg-muted transition-colors"
              onClick={handleImageClick}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 max-w-md mx-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">שם</label>
            <Input 
              placeholder="יערה שיין"
              className="text-right"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          {/* Social Page */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">עמוד סושיאל</label>
            <Input 
              placeholder="https://instagram.com/yaretakingphotos"
              className="text-right"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">ביו</label>
            <Textarea 
              placeholder="ספר קצת על עצמך..."
              className="text-right min-h-[80px] resize-none"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">מיקום</label>
            <Input 
              placeholder="בת העיר"
              className="text-right"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">התמחויות</label>
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
                  <span className="text-sm">{specialty}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-4 w-4"
                    onClick={() => {
                      const newSpecialties = formData.specialties.filter((_, i) => i !== index);
                      handleInputChange('specialties', newSpecialties);
                    }}
                  >
                    <Plus className="h-3 w-3 rotate-45" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full px-3 py-1 h-7"
                onClick={() => {
                  const newSpecialty = prompt('הוסף התמחות:');
                  if (newSpecialty?.trim()) {
                    const newSpecialties = [...formData.specialties, newSpecialty.trim()];
                    handleInputChange('specialties', newSpecialties);
                  }
                }}
              >
                <Plus className="h-3 w-3 ml-1" />
                הוסף
              </Button>
            </div>
          </div>

          {/* Join Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">חבר מאז</label>
            <Input 
              placeholder="מאי 2024"
              className="text-right"
              defaultValue="מאי 2024"
              disabled
            />
          </div>

          {/* Interests Section */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">תחומי עניין</label>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
                  <span className="text-sm">{interest}</span>
                  <Button variant="ghost" size="sm" className="p-0 h-4 w-4">
                    <Plus className="h-3 w-3 rotate-45" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="rounded-full px-3 py-1 h-7">
                <Plus className="h-3 w-3 ml-1" />
                הוסף
              </Button>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">הגדרות פרטיות</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">פרופיל פרטי</span>
              <button 
                onClick={() => handleInputChange('isPrivate', !formData.isPrivate)}
                className={`w-10 h-5 rounded-full relative transition-colors ${formData.isPrivate ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-transform ${formData.isPrivate ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">הצג בחיפוש</span>
              <button 
                onClick={() => handleInputChange('showInSearch', !formData.showInSearch)}
                className={`w-10 h-5 rounded-full relative transition-colors ${formData.showInSearch ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-transform ${formData.showInSearch ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <Button 
            className="w-full mt-8 h-12 text-base font-medium"
            onClick={handleSaveChanges}
            disabled={isLoading}
          >
            {isLoading ? "שומר..." : "שמור שינויים"}
          </Button>
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

export default EditProfilePage;