import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, DollarSign, Image, X, Save, Loader2 } from "lucide-react";
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

  // Load event data when popup opens
  useEffect(() => {
    if (eventData && isOpen) {
      setFormData({
        title: eventData.title || "",
        description: eventData.description || "",
        location: eventData.location || "",
        date: eventData.date || "",
        time: eventData.time || "",
        price: eventData.price || "",
        event_type: eventData.event_type || "event",
        image_url: eventData.image_url || "",
        external_link: eventData.external_link || ""
      });
    }
  }, [eventData, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an event title",
        variant: "destructive",
      });
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
          description: "Unable to update the event",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Event updated successfully!",
        description: "Changes have been saved to the system",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Unable to update the event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">
            {formData.event_type === 'meetup' ? 'Edit Meetup' : 'Edit Event'}
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Type */}
          <div>
            <Label htmlFor="event_type" className="text-sm font-medium">
              Event Type
            </Label>
            <Select 
              value={formData.event_type} 
              onValueChange={(value) => handleInputChange('event_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="meetup">Meetup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter event title..."
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add event description..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Add location..."
              className="mt-1"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price
            </Label>
            <Input
              id="price"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="Free / $50 / etc..."
              className="mt-1"
            />
          </div>

          {/* Image URL */}
          <div>
            <Label htmlFor="image_url" className="text-sm font-medium flex items-center gap-2">
              <Image className="h-4 w-4" />
              Image URL
            </Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="mt-1"
            />
          </div>

          {/* External Link */}
          <div>
            <Label htmlFor="external_link" className="text-sm font-medium">
              External Link
            </Label>
            <Input
              id="external_link"
              value={formData.external_link}
              onChange={(e) => handleInputChange('external_link', e.target.value)}
              placeholder="https://example.com"
              className="mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
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