import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Camera, X, CalendarDays, MapPin, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserCoupon } from "@/hooks/useUserCoupons";

interface EditCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: UserCoupon | null;
  onUpdate: () => void;
}

export const EditCouponModal = ({ isOpen, onClose, coupon, onUpdate }: EditCouponModalProps) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
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

  // Initialize form data when coupon changes
  useEffect(() => {
    if (coupon) {
      setFormData({
        title: coupon.title || "",
        description: coupon.description || "",
        business_name: coupon.business_name || "",
        discount_amount: coupon.discount_amount || "",
        valid_until: coupon.valid_until || "",
        neighborhood: coupon.neighborhood || "",
        image_url: coupon.image_url || "",
      });
      setImagePreview(coupon.image_url || null);
    }
  }, [coupon]);

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
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !coupon) {
      toast({
        title: "Error",
        description: "You must be logged in to edit coupons.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('user_coupons')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          business_name: formData.business_name.trim() || null,
          discount_amount: formData.discount_amount.trim() || null,
          valid_until: formData.valid_until || null,
          neighborhood: formData.neighborhood.trim() || null,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', coupon.id)
        .eq('user_id', user.id); // Security check

      if (error) throw error;

      toast({
        title: "Coupon Updated!",
        description: "Your coupon has been successfully updated.",
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast({
        title: "Update Error",
        description: "Failed to update coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = () => {
    if (!updating) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Coupon</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Coupon Image</Label>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Coupon preview" 
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <label htmlFor="image-upload" className="cursor-pointer text-primary hover:text-primary/80">
                      Click to upload an image
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Coupon Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., 20% off coffee"
              required
            />
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business_name">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Business Name
            </Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
              placeholder="e.g., Local Coffee Shop"
            />
          </div>

          {/* Discount Amount */}
          <div className="space-y-2">
            <Label htmlFor="discount_amount">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Discount Amount
            </Label>
            <Input
              id="discount_amount"
              value={formData.discount_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: e.target.value }))}
              placeholder="e.g., 20%, $10 off, Buy 1 Get 1"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the coupon terms and conditions..."
              rows={3}
            />
          </div>

          {/* Valid Until */}
          <div className="space-y-2">
            <Label htmlFor="valid_until">
              <CalendarDays className="h-4 w-4 inline mr-1" />
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
            <Label htmlFor="neighborhood">
              <MapPin className="h-4 w-4 inline mr-1" />
              Neighborhood
            </Label>
            <Input
              id="neighborhood"
              value={formData.neighborhood}
              onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
              placeholder="e.g., Downtown, City Center"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updating || uploading || !formData.title.trim()}
              className="flex-1"
            >
              {updating ? "Updating..." : "Update Coupon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};