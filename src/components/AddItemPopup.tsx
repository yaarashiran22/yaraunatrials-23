import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNewItem } from "@/contexts/NewItemContext";

interface AddItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemPopup = ({ isOpen, onClose }: AddItemPopupProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshItems } = useNewItem();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = title.trim() && category && location && mobileNumber.trim() && selectedImage;

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר כדי להוסיף פריט",
        variant: "destructive",
      });
      return;
    }

    if (!isFormValid) {
      toast({
        title: "שגיאה", 
        description: "יש למלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image to Supabase storage first
      let imageUrl = null;
      if (selectedImage) {
        const file = await fetch(selectedImage).then(r => r.blob());
        const fileExt = 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue without image if upload fails
        } else {
          const { data: urlData } = supabase.storage
            .from('item-images')
            .getPublicUrl(uploadData.path);
          imageUrl = urlData.publicUrl;
        }
      }

      // Insert item into database
      const { error } = await supabase
        .from('items')
        .insert({
          title: title.trim(),
          price: price ? parseFloat(price) : null,
          category,
          location,
          mobile_number: mobileNumber.trim(),
          image_url: imageUrl,
          user_id: user.id,
          status: 'active',
          market: 'israel'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "הצלחה!",
        description: "הפריט נוסף בהצלחה",
      });

      // Reset form
      setTitle('');
      setPrice('');
      setCategory('');
      setLocation('');
      setMobileNumber('');
      setSelectedImage(null);
      
      // Refresh the homepage data
      refreshItems();
      
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הפריט",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="w-full max-w-md bg-background rounded-3xl max-h-[90vh] overflow-hidden mx-4" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-2">
            <NeighborhoodSelector />
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Title */}
        <div className="px-4 py-3">
          <h2 className="text-lg font-semibold text-center">פריט חדש</h2>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 space-y-3 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Title Field */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground block text-right">כותרת</label>
            <Input 
              placeholder=""
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 text-right bg-background border border-border rounded-full px-4"
            />
          </div>

          {/* Price Field */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground block text-right">מחיר</label>
            <Input 
              placeholder=""
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full h-11 text-right bg-background border border-border rounded-full px-4"
            />
          </div>

          {/* Category Field */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground block text-right">קטגוריה</label>
            <Select dir="rtl" value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full h-11 text-right bg-background border border-border rounded-full px-4">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="מוזמנים להצטרף">מוזמנים להצטרף</SelectItem>
                <SelectItem value="art">אמנות</SelectItem>
                <SelectItem value="secondhand">יד שנייה</SelectItem>
                <SelectItem value="business">עסק</SelectItem>
                <SelectItem value="event">אירוע</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Field */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground block text-right">מיקום</label>
            <Select dir="rtl" value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full h-11 text-right bg-background border border-border rounded-full px-4">
                <SelectValue placeholder="בחר מיקום" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="tel-aviv">תל אביב</SelectItem>
                <SelectItem value="florentin">פלורנטין</SelectItem>
                <SelectItem value="lev-hair">לב העיר</SelectItem>
                <SelectItem value="jerusalem">ירושלים</SelectItem>
                <SelectItem value="ramat-gan">רמת גן</SelectItem>
                <SelectItem value="givatayim">גבעתיים</SelectItem>
              </SelectContent>
            </Select>
          </div>


          {/* Contact Mobile Number Field */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground block text-right">מספר נייד ליצירת קשר</label>
            <Input 
              placeholder=""
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full h-11 text-right bg-background border border-border rounded-full px-4"
            />
          </div>

          {/* Add Image Button */}
          <div className="relative pt-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <Button 
              variant="outline"
              className="w-full h-11 bg-background border border-border rounded-full text-foreground hover:bg-muted/20"
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף תמונה
            </Button>
          </div>

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="w-full h-32 rounded-2xl overflow-hidden border border-border">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              className="w-full h-11 rounded-full text-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#BB31E9' }}
              disabled={!isFormValid || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "שומר..." : "שמור"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemPopup;