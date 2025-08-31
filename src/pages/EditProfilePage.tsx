import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Bell, Camera, Plus, Coffee, Zap, Heart, Dumbbell, Palette, Users } from "lucide-react";
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
  { id: "sightseeing", label: "Sightseeing", icon: Camera, color: "text-cyan-500" }
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
    interests: ['chill', 'creative'],
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
        interests: profile.interests || ['chill', 'creative'],
        isPrivate: profile.is_private || false,
        showInSearch: profile.show_in_search !== false // Default to true if null/undefined
      });

      if (profile.profile_image_url) {
        setProfileImage(profile.profile_image_url);
      }
    }
  }, [profile]);

  return (
    <div className="min-h-screen bg-background" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div></div> {/* Empty div for spacing */}
        <h2 className="text-lg font-semibold">Edit Profile</h2>
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
              alt="Profile picture"
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
            <label className="block text-sm font-medium text-foreground mb-2">Name</label>
            <Input 
              placeholder="John Doe"
              className="text-left"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          {/* Social Page */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Social Page</label>
            <Input 
              placeholder="https://instagram.com/johndoe"
              className="text-left"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
            <Textarea 
              placeholder="Tell us a little about yourself..."
              className="text-left min-h-[80px] resize-none"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Location</label>
            <Input 
              placeholder="New York City"
              className="text-left"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Specialties</label>
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


          {/* Mood Interests Section */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Mood Interests</label>
            <div className="grid grid-cols-2 gap-3">
              {moodFilters.map((mood) => {
                const IconComponent = mood.icon;
                const isSelected = formData.interests.includes(mood.id);
                
                return (
                  <Button
                    key={mood.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`flex items-center gap-2 justify-start px-3 py-2 h-auto ${
                      isSelected 
                        ? `${mood.color} bg-muted border-current/20` 
                        : `${mood.color} hover:bg-muted/50`
                    }`}
                    onClick={() => {
                      const newInterests = isSelected
                        ? formData.interests.filter(id => id !== mood.id)
                        : [...formData.interests, mood.id];
                      handleInputChange('interests', newInterests);
                    }}
                  >
                    <IconComponent className={`h-4 w-4 ${mood.color}`} />
                    <span className="text-sm font-medium">{mood.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Privacy Settings</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Private Profile</span>
              <button 
                onClick={() => handleInputChange('isPrivate', !formData.isPrivate)}
                className={`w-10 h-5 rounded-full relative transition-colors ${formData.isPrivate ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-transform ${formData.isPrivate ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Show in Search</span>
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