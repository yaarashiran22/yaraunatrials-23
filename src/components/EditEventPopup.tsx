import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, DollarSign, Image, X, Save, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EditEventPopupProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: any;
  onSuccess?: () => void;
}

const EditEventPopup = ({ isOpen, onClose, eventData, onSuccess }: EditEventPopupProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    price: "",
    event_type: "event",
    image_url: "",
    external_link: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load event data when popup opens
  useEffect(() => {
    if (eventData && isOpen) {
      const newFormData = {
        title: eventData.title || "",
        description: eventData.description || "",
        location: eventData.location || "",
        date: eventData.date || "",
        time: eventData.time || "",
        price: eventData.price || "",
        event_type: eventData.event_type || "event",
        image_url: eventData.image_url || "",
        external_link: eventData.external_link || ""
      };
      setFormData(newFormData);
      setImagePreview(newFormData.image_url || null);
      setShowAdvanced(Boolean(newFormData.external_link || newFormData.image_url));
    }
  }, [eventData, isOpen]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }
    
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = "Please enter a valid image URL";
    }
    
    if (formData.external_link && !isValidUrl(formData.external_link)) {
      newErrors.external_link = "Please enter a valid URL";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }

    // Update image preview
    if (field === 'image_url') {
      setImagePreview(value && isValidUrl(value) ? value : null);
    }
  };

  const handleSave = async () => {
    if (!eventData?.id) {
      toast({
        title: "Error",
        description: "Unable to update the event",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          location: formData.location.trim() || null,
          date: formData.date || null,
          time: formData.time || null,
          price: formData.price.trim() || null,
          event_type: formData.event_type,
          image_url: formData.image_url.trim() || null,
          external_link: formData.external_link.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventData.id);

      if (error) {
        console.error('Error updating event:', error);
        toast({
          title: "Error",
          description: "Unable to update the event. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "✨ Success!",
        description: `${formData.event_type === 'meetup' ? 'Meetup' : 'Event'} updated successfully`,
        duration: 3000,
      });

      // Trigger global event update
      window.dispatchEvent(new CustomEvent('eventUpdated'));
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-white to-primary-50/20 border-0 shadow-xl">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20">
                {formData.event_type === 'meetup' ? (
                  <Calendar className="h-5 w-5 text-primary" />
                ) : (
                  <Calendar className="h-5 w-5 text-secondary" />
                )}
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {formData.event_type === 'meetup' ? 'Edit Meetup' : 'Edit Event'}
              </DialogTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your {formData.event_type} details and settings
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Type Selection */}
          <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm">
            <Label htmlFor="event_type" className="text-sm font-semibold text-foreground mb-3 block">
              Event Type
            </Label>
            <Select 
              value={formData.event_type} 
              onValueChange={(value) => handleInputChange('event_type', value)}
            >
              <SelectTrigger className="h-11 bg-white border-primary/20 focus:border-primary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-primary/20 shadow-lg z-50">
                <SelectItem value="event">🎉 Event</SelectItem>
                <SelectItem value="meetup">👥 Meetup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information */}
          <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground mb-3">Basic Information</h3>
            
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                Title <span className="text-red-500">*</span>
                {formData.title && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title..."
                className={`h-11 transition-all ${errors.title ? 'border-red-500 focus:border-red-500' : 'border-primary/20 focus:border-primary/50'}`}
              />
              {errors.title && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell people about your event..."
                className="min-h-[100px] border-primary/20 focus:border-primary/50 transition-all resize-none"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground mb-3">Event Details</h3>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Where will this take place?"
                className="h-11 border-primary/20 focus:border-primary/50 transition-all"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-secondary" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="h-11 border-primary/20 focus:border-primary/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="h-11 border-primary/20 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Price
              </Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Free, $50, €25, etc..."
                className="h-11 border-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Advanced Options</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-primary hover:text-primary-600 hover:bg-primary/10"
              >
                {showAdvanced ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>

            {showAdvanced && (
              <div className="space-y-4 animate-fade-in">
                {/* Image URL with Preview */}
                <div className="space-y-2">
                  <Label htmlFor="image_url" className="text-sm font-medium flex items-center gap-2">
                    <Image className="h-4 w-4 text-purple-600" />
                    Event Image URL
                  </Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={`h-11 transition-all ${errors.image_url ? 'border-red-500 focus:border-red-500' : 'border-primary/20 focus:border-primary/50'}`}
                  />
                  {errors.image_url && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.image_url}
                    </div>
                  )}
                  {imagePreview && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-primary/20">
                      <img 
                        src={imagePreview} 
                        alt="Event preview" 
                        className="w-full h-32 object-cover"
                        onError={() => setImagePreview(null)}
                      />
                    </div>
                  )}
                </div>

                {/* External Link */}
                <div className="space-y-2">
                  <Label htmlFor="external_link" className="text-sm font-medium flex items-center gap-2">
                    <Link className="h-4 w-4 text-blue-600" />
                    External Link
                  </Label>
                  <Input
                    id="external_link"
                    value={formData.external_link}
                    onChange={(e) => handleInputChange('external_link', e.target.value)}
                    placeholder="https://example.com"
                    className={`h-11 transition-all ${errors.external_link ? 'border-red-500 focus:border-red-500' : 'border-primary/20 focus:border-primary/50'}`}
                  />
                  {errors.external_link && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.external_link}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-primary/10">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary-600 hover:to-secondary-600 text-white shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
              className="sm:w-32 h-11 border-primary/30 text-primary hover:bg-primary/10 transition-all"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventPopup;