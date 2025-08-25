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
  const [eventType, setEventType] = useState<'event' | 'meetup'>('event');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const isVideo = file.type.startsWith('video/');
      setFileType(isVideo ? 'video' : 'image');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
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

    if (!selectedFile) {
      toast({
        title: "שגיאה", 
        description: "נא להוסיף תמונה או וידאו לאירוע",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload file to Supabase storage
      let imageUrl = null;
      let videoUrl = null;
      
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const bucketName = fileType === 'video' ? 'videos' : 'item-images';
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);
          
        if (fileType === 'video') {
          videoUrl = data.publicUrl;
        } else {
          imageUrl = data.publicUrl;
        }
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
          video_url: videoUrl,
          external_link: externalLink.trim() || null,
          event_type: eventType,
          market: 'israel'
        });

      if (error) throw error;

      toast({
        title: eventType === 'meetup' ? "המפגש נוצר בהצלחה!" : "האירוע נוצר בהצלחה!",
        description: eventType === 'meetup' ? "המפגש שלך נוסף לעמוד המפגשים" : "האירוע שלך נוסף לעמוד האירועים",
      });

      // Reset form
      setEventName("");
      setDescription("");
      setDate("");
      setTime("");
      setLocation("");
      setPrice("");
      setExternalLink("");
      setEventType('event');
      setSelectedFile(null);
      setFilePreview(null);
      setFileType(null);

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
          <h2 className="text-lg font-bold text-foreground">
            {eventType === 'meetup' ? 'מפגש חדש' : 'אירוע חדש'}
          </h2>
          <div className="w-9" />
        </div>

        <div className="p-6 space-y-6">
          {/* Event Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">
              {eventType === 'meetup' ? 'שם המפגש*' : 'שם האירוע*'}
            </label>
            <Input 
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder={eventType === 'meetup' ? 'הזן שם למפגש' : 'הזן שם לאירוע'}
              className="w-full h-12 text-right bg-card border-2 border-border rounded-full"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">תיאור</label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={eventType === 'meetup' ? 'תאר את המפגש שלך' : 'תאר את האירוע שלך'}
              className="w-full min-h-24 text-right bg-card border-2 border-border rounded-2xl resize-none"
            />
          </div>

          {/* Event Type Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">סוג*</label>
            <Select value={eventType} onValueChange={(value: 'event' | 'meetup') => setEventType(value)}>
              <SelectTrigger className="w-full h-12 text-right bg-background border-2 border-border rounded-full">
                <SelectValue placeholder="בחר סוג" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="event" className="text-right cursor-pointer hover:bg-muted">
                  אירוע
                </SelectItem>
                <SelectItem value="meetup" className="text-right cursor-pointer hover:bg-muted">
                  מפגש
                </SelectItem>
              </SelectContent>
            </Select>
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

          {/* Media Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">תמונה או וידאו*</label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="media-upload"
              />
              <label 
                htmlFor="media-upload"
                className="w-full h-12 bg-card border-2 border-border rounded-full flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Camera className="h-5 w-5" />
                  <span className="text-sm">{selectedFile ? selectedFile.name : "בחר תמונה או וידאו"}</span>
                </div>
              </label>
              {filePreview && (
                <div className="w-full h-32 bg-muted rounded-2xl overflow-hidden">
                  {fileType === 'video' ? (
                    <video 
                      src={filePreview} 
                      className="w-full h-full object-cover"
                      controls
                      muted
                    />
                  ) : (
                    <img 
                      src={filePreview} 
                      alt="תצוגה מקדימה" 
                      className="w-full h-full object-cover"
                    />
                  )}
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
              {isSubmitting ? 
                (eventType === 'meetup' ? "יוצר מפגש..." : "יוצר אירוע...") : 
                (eventType === 'meetup' ? "צור מפגש" : "צור אירוע")
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPopup;