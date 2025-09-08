import { useState } from "react";
import { 
  SimplifiedModal, 
  SimplifiedModalContent, 
  SimplifiedModalHeader, 
  SimplifiedModalTitle,
  SimplifiedModalBody 
} from "@/components/ui/simplified-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Camera, X, CalendarDays, MapPin, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useUserCoupons } from "@/hooks/useUserCoupons";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { InstagramStoryPopup } from "@/components/InstagramStoryPopup";

interface AddCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCouponModal = ({ isOpen, onClose }: AddCouponModalProps) => {
  const { user } = useAuth();
  const { createCoupon, creating } = useUserCoupons();
  const { profile } = useProfile(user?.id);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showStoryPopup, setShowStoryPopup] = useState(false);
  const [generatedStoryUrl, setGeneratedStoryUrl] = useState<string | null>(null);
  const [generatingStory, setGeneratingStory] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    business_name: "",
    discount_amount: "",
    valid_until: "",
    neighborhood: "",
    image_url: "",
  });

  const handleImageUpload = async (file: File) => {
    if (!user) return;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setImagePreview(publicUrl);
      
      toast({
        title: "Image uploaded successfully!",
        description: "Your coupon image has been uploaded.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const generateInstagramStory = async (couponData: any) => {
    setGeneratingStory(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-instagram-story', {
        body: {
          type: 'coupon',
          data: {
            ...couponData,
            user_id: user?.id
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedStoryUrl(data.storyUrl);
        setShowStoryPopup(true);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating Instagram story:', error);
      toast({
        title: "Story Generation Failed",
        description: "Failed to generate Instagram story. You can still share your coupon normally.",
        variant: "destructive",
      });
    } finally {
      setGeneratingStory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a coupon.",
        variant: "destructive",
      });
      return;
    }

    if (profile?.account_type !== 'business') {
      toast({
        title: "Business account required",
        description: "Only business accounts can create coupons. Please switch to a business account in settings.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your coupon.",
        variant: "destructive",
      });
      return;
    }

    const couponData = {
      ...formData,
      user_id: user.id,
      valid_until: formData.valid_until || undefined,
    };

    createCoupon(couponData);
    
    // Generate Instagram story after creating coupon
    await generateInstagramStory(couponData);
    
    // Reset form and close modal
    setFormData({
      title: "",
      description: "",
      business_name: "",
      discount_amount: "",
      valid_until: "",
      neighborhood: "",
      image_url: "",
    });
    setImagePreview(null);
    onClose();
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  return (
    <SimplifiedModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SimplifiedModalContent className="max-w-lg bg-card border-border/20 shadow-2xl">
        <SimplifiedModalHeader className="pb-4 border-b border-border/10">
          <SimplifiedModalTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Add Community Coupon</h2>
              <p className="text-sm text-muted-foreground font-normal">Create an exclusive deal for your community</p>
            </div>
          </SimplifiedModalTitle>
        </SimplifiedModalHeader>
        
        <SimplifiedModalBody className="p-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label htmlFor="image" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Coupon Image
              </Label>
              {imagePreview ? (
                <div className="relative group">
                  <img 
                    src={imagePreview} 
                    alt="Coupon preview" 
                    className="w-full h-40 object-cover rounded-xl border border-border/20 shadow-sm"
                  />
                  <Button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border/40 rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Camera className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">Upload coupon image</p>
                      <p className="text-sm text-muted-foreground">JPG, PNG up to 10MB</p>
                    </div>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                    <Label 
                      htmlFor="image"
                      className="cursor-pointer inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
                    >
                      {uploading ? "Uploading..." : "Choose Image"}
                    </Label>
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 gap-4">
              {/* Title - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                  Coupon Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., 20% off all pizzas"
                  required
                  className="h-11 text-base border-border/40 focus:border-primary transition-colors"
                />
              </div>

              {/* Business Name & Discount Amount - Two Columns */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="business_name" className="text-sm font-semibold text-foreground">
                    Business Name
                  </Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                    placeholder="Tony's Pizza"
                    className="h-10 text-sm border-border/40 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_amount" className="text-sm font-semibold text-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Discount
                  </Label>
                  <Input
                    id="discount_amount"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: e.target.value }))}
                    placeholder="20% off"
                    className="h-10 text-sm border-border/40 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Description - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add details about the coupon terms and conditions..."
                  rows={3}
                  className="text-sm border-border/40 focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Valid Until & Neighborhood - Two Columns */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="valid_until" className="text-sm font-semibold text-foreground flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    Valid Until
                  </Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    className="h-10 text-sm border-border/40 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood" className="text-sm font-semibold text-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Neighborhood
                  </Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    placeholder="Downtown"
                    className="h-10 text-sm border-border/40 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border/10">
              <Button 
                type="submit"
                disabled={creating || uploading || !formData.title.trim()}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm disabled:opacity-50"
              >
                {creating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Creating coupon...
                  </div>
                ) : (
                  "Create Coupon"
                )}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="w-full h-10 border-border/40 hover:bg-muted/50 transition-colors"
              >
                Cancel
              </Button>
            </div>
          </form>
        </SimplifiedModalBody>
      </SimplifiedModalContent>
      
      <InstagramStoryPopup
        isOpen={showStoryPopup}
        onClose={() => setShowStoryPopup(false)}
        storyUrl={generatedStoryUrl}
        isGenerating={generatingStory}
        title={formData.title}
      />
    </SimplifiedModal>
  );
};