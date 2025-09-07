import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Bell, Camera, Plus, Coffee, Zap, Heart, Dumbbell, Palette, Users, Music } from "lucide-react";
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

const moodFilters = [
  { id: "chill", label: "Chill", icon: Coffee, color: "text-blue-500" },
  { id: "go-out", label: "Go Out", icon: Zap, color: "text-orange-500" },
  { id: "romantic", label: "Romantic", icon: Heart, color: "text-pink-500" },
  { id: "active", label: "Active", icon: Dumbbell, color: "text-green-500" },
  { id: "creative", label: "Creative", icon: Palette, color: "text-purple-500" },
  { id: "social", label: "Social", icon: Users, color: "text-indigo-500" },
  { id: "music", label: "Music", icon: Music, color: "text-cyan-500" }
];

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
        title: "Error",
        description: "User not logged in",
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
        is_private: formData.isPrivate,
        show_in_search: formData.showInSearch,
      };

      // Only include profile_image_url if a new image was uploaded
      if (profileImageUrl) {
        updateData.profile_image_url = profileImageUrl;
      }

      await updateProfile(updateData);
      
      toast({
        title: "Changes saved successfully",
        description: "Your profile has been updated",
      });
      
      // Navigate back after successful save
      navigate(-1);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving changes",
        description: error.message || "Please try again later",
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
        isPrivate: profile.is_private || false,
        showInSearch: profile.show_in_search !== false // Default to true if null/undefined
      });

      if (profile.profile_image_url) {
        setProfileImage(profile.profile_image_url);
      }
    }
  }, [profile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/30 to-coral-50/30" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm border-primary-200/30">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(user ? `/profile/${user.id}` : '/')}
          className="hover:bg-primary-100/50 transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-primary" />
        </Button>
        <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">Edit Profile</h2>
        <div></div> {/* Empty div for spacing */}
      </div>

      <main className="px-4 py-6 pb-20">
        {/* Page content starts here - title removed since it's now in header */}

        {/* Profile Picture Section */}
        <div className="flex justify-center mb-8 mt-6">
          <div className="relative">
            <div className="w-[108px] h-[108px] rounded-full bg-gradient-to-br from-coral to-primary p-1">
              <img 
                src={profileImage}
                alt="Profile picture"
                className="w-full h-full rounded-full object-cover bg-white p-1"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-white border-2 border-coral/30 hover:bg-coral hover:text-white hover:border-coral transition-all shadow-lg hover:shadow-coral/25"
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
        <div className="space-y-6 max-w-md mx-auto bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-primary-200/30 shadow-xl">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent mb-2">Name</label>
            <Input 
              placeholder="John Doe"
              className="text-left border-primary-200/40 focus:border-primary focus:ring-primary/20 bg-white/80"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          {/* Social Page */}
          <div>
            <label className="block text-sm font-medium bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent mb-2">Social Page</label>
            <Input 
              placeholder="https://instagram.com/johndoe"
              className="text-left border-primary-200/40 focus:border-primary focus:ring-primary/20 bg-white/80"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent mb-2">Bio</label>
            <Textarea 
              placeholder="Tell us a little about yourself..."
              className="text-left min-h-[80px] resize-none border-primary-200/40 focus:border-primary focus:ring-primary/20 bg-white/80"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent mb-2">Neighborhood</label>
            <Input 
              placeholder="New York City"
              className="text-left border-primary-200/40 focus:border-primary focus:ring-primary/20 bg-white/80"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent mb-3">Specialties</label>
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty, index) => (
                <div key={index} className="flex items-center gap-2 bg-gradient-to-r from-coral-100 to-primary-100 rounded-full px-3 py-1 border border-coral-200/50">
                  <span className="text-sm text-coral-700 font-medium">{specialty}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-4 w-4 hover:bg-coral-200/50 text-coral-600 hover:text-coral-700 rounded-full"
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
                className="rounded-full px-3 py-1 h-7 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-md"
                onClick={() => {
                  const newSpecialty = prompt('Add specialty:');
                  if (newSpecialty?.trim()) {
                    const newSpecialties = [...formData.specialties, newSpecialty.trim()];
                    handleInputChange('specialties', newSpecialties);
                  }
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4 pt-4 border-t border-primary-200/30">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Privacy Settings</h3>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary-50 to-coral-50 border border-primary-200/30">
              <span className="text-sm font-medium text-primary-700">Private Profile</span>
              <button 
                onClick={() => handleInputChange('isPrivate', !formData.isPrivate)}
                className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${formData.isPrivate ? 'bg-gradient-to-r from-coral to-primary' : 'bg-neutral-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-lg transition-transform ${formData.isPrivate ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary-50 to-coral-50 border border-primary-200/30">
              <span className="text-sm font-medium text-primary-700">Show in Search</span>
              <button 
                onClick={() => handleInputChange('showInSearch', !formData.showInSearch)}
                className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${formData.showInSearch ? 'bg-gradient-to-r from-coral to-primary' : 'bg-neutral-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-lg transition-transform ${formData.showInSearch ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <Button 
            className="w-full mt-8 h-12 text-base font-medium bg-gradient-to-r from-primary to-coral hover:from-primary-600 hover:to-coral-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            onClick={handleSaveChanges}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
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