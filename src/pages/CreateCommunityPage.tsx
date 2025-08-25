import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunities } from "@/hooks/useCommunities";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import DesktopHeader from "@/components/DesktopHeader";
import BottomNavigation from "@/components/BottomNavigation";

const CreateCommunityPage = () => {
  const { user } = useAuth();
  const { createCommunity } = useCommunities();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    category: 'interests' as 'interests' | 'causes' | 'identity',
    subcategory: '',
    access_type: 'closed' as 'open' | 'closed' | 'invite_only'
  });

  const categories = {
    interests: ['Skating', 'Salsa', 'Yoga', 'Foodies', 'Techies', 'Expats', 'Photography', 'Music', 'Sports'],
    causes: ['Volunteering', 'Sustainability', 'Arts', 'Education', 'Animals', 'Environment', 'Health'],
    identity: ['Young Expats', 'Digital Nomads', 'Queer Community', 'Parents', 'Students', 'Professionals']
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setCoverFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `community-images/${fileName}`;

    console.log('Uploading image to:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    console.log('Upload successful, public URL:', publicUrl);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to create a community",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a community name",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      
      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadImage(logoFile);
      }

      let coverUrl = null;
      if (coverFile) {
        coverUrl = await uploadImage(coverFile);
      }

      const communityData = {
        ...formData,
        creator_id: user.id,
        name: formData.name.trim(),
        tagline: formData.tagline.trim() || null,
        description: formData.description.trim() || null,
        subcategory: formData.subcategory || null
      };

      if (logoUrl) {
        (communityData as any).logo_url = logoUrl;
      }

      if (coverUrl) {
        (communityData as any).cover_image_url = coverUrl;
      }

      await createCommunity(communityData);

      toast({
        title: "Community Created!",
        description: `${formData.name} has been created successfully`,
      });

      navigate('/communities');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header 
          title="Create Community"
        />
        <div className="absolute top-4 left-4 z-10">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/communities')}
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Desktop Header */}
      <DesktopHeader 
        title="Create Community"
      />
      <div className="hidden lg:block absolute top-4 left-4 z-10">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/communities')}
          className="h-8 w-8 bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <main className="px-4 py-6 pb-24 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image Upload */}
          <div className="space-y-2">
            <Label>Cover Image (Optional)</Label>
            <div className="flex items-center gap-4">
              {coverPreview ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-full h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Upload cover image</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => coverInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Cover Image
            </Button>
            <p className="text-xs text-muted-foreground">
              Max 5MB, 16:9 aspect ratio recommended
            </p>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Community Logo (Optional)</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img src={logoPreview} alt="Logo preview" className="w-20 h-20 rounded-lg object-cover border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground/50" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5MB, PNG/JPG recommended
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Palermo Salsa Dancers"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={formData.tagline}
              onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="Brief description in one line"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value, subcategory: '' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interests">Interests</SelectItem>
                  <SelectItem value="causes">Causes</SelectItem>
                  <SelectItem value="identity">Identity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select 
                value={formData.subcategory} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {categories[formData.category].map((sub) => (
                    <SelectItem key={sub} value={sub.toLowerCase()}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Access Type</Label>
            <Select 
              value={formData.access_type} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, access_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open - Anyone can join</SelectItem>
                <SelectItem value="closed">Closed - Approval required</SelectItem>
                <SelectItem value="invite_only">Invite Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your community, its purpose, and what members can expect..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={creating} className="flex-1">
              {creating ? "Creating..." : "Create Community"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/communities')}
              disabled={creating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default CreateCommunityPage;