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
      <SimplifiedModalContent className="max-w-lg bg-violet-50/30 backdrop-blur-sm">
        <SimplifiedModalHeader>
          <SimplifiedModalTitle className="flex items-center gap-3">
            <Upload className="w-7 h-7 text-primary" />
            Add Community Coupon
          </SimplifiedModalTitle>
        </SimplifiedModalHeader>
        
        <SimplifiedModalBody>
          <form onSubmit={handleSubmit} className="space-y-content-normal">
          {/* Image Upload */}
          <div className="space-y-4">
            <Label htmlFor="image" className="text-lg font-medium">
              Coupon Image
            </Label>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Coupon preview" 
                  className="w-full h-48 object-cover rounded-lg border border-border/20"
                />
                <Button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-destructive hover:bg-destructive/90"
                  size="icon-sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center">
                <Camera className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                <p className="text-base text-muted-foreground mb-6">
                  Upload a picture of your coupon
                </p>
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
                  className="cursor-pointer inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors text-base font-medium min-h-touch"
                >
                  {uploading ? "Uploading..." : "Choose Image"}
                </Label>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-4">
            <Label htmlFor="title" className="text-lg font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., 20% off pizza"
              required
              className="text-base min-h-touch"
            />
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business_name" className="text-sm font-medium">
              Business Name
            </Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
              placeholder="e.g., Tony's Pizza"
            />
          </div>

          {/* Discount Amount */}
          <div className="space-y-2">
            <Label htmlFor="discount_amount" className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Discount
            </Label>
            <Input
              id="discount_amount"
              value={formData.discount_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: e.target.value }))}
              placeholder="e.g., 20% off, $10 off, Buy 1 get 1"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add details about the coupon..."
              rows={3}
            />
          </div>

          {/* Valid Until */}
          <div className="space-y-2">
            <Label htmlFor="valid_until" className="text-sm font-medium flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Valid Until
            </Label>
            <Input
              id="valid_until"
              type="date"
              value={formData.valid_until}
              onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
            />
          </div>

          {/* Neighborhood */}
          <div className="space-y-2">
            <Label htmlFor="neighborhood" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Neighborhood
            </Label>
            <Input
              id="neighborhood"
              value={formData.neighborhood}
              onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
              placeholder="e.g., Downtown, SoHo, etc."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pt-content-normal">
            <Button 
              type="submit"
              disabled={creating || uploading || !formData.title.trim()}
              className="w-full"
              size="lg"
            >
              {creating ? "Creating..." : "Upload Coupon"}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              className="w-full"
              size="default"
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