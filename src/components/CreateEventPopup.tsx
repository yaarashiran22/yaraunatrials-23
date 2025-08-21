import { X, Plus, Calendar, Clock, MapPin, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreateEventPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
}

const CreateEventPopup = ({ isOpen, onClose, onEventCreated }: CreateEventPopupProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Neighborhoods available in the website
  const neighborhoods = [
    "לב העיר",
    "נחלת בנימין", 
    "רוטשילד",
    "פלורנטין",
    "שפירא",
    "יפו העתיקה",
    "עג'מי",
    "נווה צדק",
    "כרם התימנים",
    "שכונת מונטיפיורי",
    "רמת אביב",
    "צפון ישן",
    "שינקין",
    "דיזנגוף",
    "הרצליה",
    "בת ים",
    "רמת גן",
    "גבעתיים",
    "חולון"
  ];

  if (!isOpen) return null;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "עליך להתחבר כדי ליצור אירוע",
        variant: "destructive",
      });
      return;
    }

    if (!eventName.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין שם לאירוע",
        variant: "destructive",
      });
      return;
    }

    if (!date.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין תאריך לאירוע",
        variant: "destructive",
      });
      return;
    }

    if (!location.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין מיקום לאירוע",
        variant: "destructive",
      });
      return;
    }

    if (!selectedImage) {
      toast({
        title: "שגיאה", 
        description: "נא להוסיף תמונה לאירוע",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload image to Supabase storage
      let imageUrl = null;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);
          
        imageUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: eventName.trim(),
          description: description.trim() || null,
          date: date || null,
          time: time || null,
          location: location.trim(),
          price: price.trim() || null,
          image_url: imageUrl,
          external_link: externalLink.trim() || null,
          market: 'israel'
        });

      if (error) throw error;

      toast({
        title: "האירוע נוצר בהצלחה!",
        description: "האירוע שלך נוסף לעמוד האירועים",
      });

      // Reset form
      setEventName("");
      setDescription("");
      setDate("");
      setTime("");
      setLocation("");
      setPrice("");
      setExternalLink("");
      setSelectedImage(null);
      setImagePreview(null);

      // Call callback to refresh data
      if (onEventCreated) {
        onEventCreated();
      }

      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן היה ליצור את האירוע. נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4" dir="rtl">
      <div className="bg-background rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-bold text-foreground">אירוע חדש</h2>
          <div className="w-9" />
        </div>

        <div className="p-6 space-y-6">
          {/* Event Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">שם האירוע*</label>
            <Input 
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="הזן שם לאירוע"
              className="w-full h-12 text-right bg-card border-2 border-border rounded-full"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">תיאור</label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תאר את האירוע שלך"
              className="w-full min-h-24 text-right bg-card border-2 border-border rounded-2xl resize-none"
            />
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">תאריך*</label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 pr-12 text-right bg-card border-2 border-border rounded-full"
              />
            </div>
          </div>

          {/* Time Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">שעה</label>
            <div className="relative">
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-12 pr-12 text-right bg-card border-2 border-border rounded-full"
              />
            </div>
          </div>

          {/* Location Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">מיקום*</label>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full h-12 pr-12 text-right bg-background border-2 border-border rounded-full">
                  <SelectValue placeholder="בחר שכונה" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50 max-h-60">
                  {neighborhoods.map((neighborhood) => (
                    <SelectItem 
                      key={neighborhood} 
                      value={neighborhood}
                      className="text-right cursor-pointer hover:bg-muted"
                    >
                      {neighborhood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">מחיר (אופציונלי)</label>
            <Input 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="חינם / 50 ₪"
              className="w-full h-12 text-right bg-card border-2 border-border rounded-full"
            />
          </div>

          {/* External Link Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">קישור חיצוני (אופציונלי)</label>
            <Input 
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://example.com"
              className="w-full h-12 text-right bg-card border-2 border-border rounded-full"
            />
          </div>

          {/* Image Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">תמונת האירוע*</label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label 
                htmlFor="image-upload"
                className="w-full h-12 bg-card border-2 border-border rounded-full flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Camera className="h-5 w-5" />
                  <span className="text-sm">{selectedImage ? selectedImage.name : "בחר תמונה"}</span>
                </div>
              </label>
              {imagePreview && (
                <div className="w-full h-32 bg-muted rounded-2xl overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="תצוגה מקדימה" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-lg font-medium"
            >
              {isSubmitting ? "יוצר אירוע..." : "צור אירוע"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPopup;