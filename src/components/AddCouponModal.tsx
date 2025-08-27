import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Camera, X, CalendarDays, MapPin, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useUserCoupons } from "@/hooks/useUserCoupons";
import { useAuth } from "@/contexts/AuthContext";

interface AddCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCouponModal = ({ isOpen, onClose }: AddCouponModalProps) => {
  const { user } = useAuth();
  const { createCoupon, creating } = useUserCoupons();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a coupon.",
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

    createCoupon({
      ...formData,
      user_id: user.id,
      valid_until: formData.valid_until || undefined,
    });
    
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md mx-auto bg-background border border-border/50 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary" />
            Add Community Coupon
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
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
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-destructive hover:bg-destructive/90"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
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
                  className="cursor-pointer inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  {uploading ? "Uploading..." : "Choose Image"}
                </Label>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., 20% off pizza"
              required
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
          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={creating || uploading || !formData.title.trim()}
              className="flex-1"
            >
              {creating ? "Creating..." : "Upload Coupon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};