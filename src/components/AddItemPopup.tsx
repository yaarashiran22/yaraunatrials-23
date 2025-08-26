import { X, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemPopup = ({ isOpen, onClose }: AddItemPopupProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Sign in anonymously if no user
      const { data: { user } } = await supabase.auth.getUser();
      let currentUserId = user?.id;
      
      if (!currentUserId) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) throw authError;
        currentUserId = authData.user?.id;
      }

      if (!currentUserId) {
        throw new Error('Failed to authenticate user');
      }

      let imageUrl = null;

      // Upload image if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Insert item into database
      const { error: insertError } = await supabase
        .from('items')
        .insert({
          user_id: currentUserId,
          title,
          price: price ? parseFloat(price) : null,
          category,
          location,
          mobile_number: mobileNumber,
          image_url: imageUrl,
          market: 'argentina'
        });

      if (insertError) throw insertError;

      toast({
        title: "הפריט נוסף בהצלחה!",
        description: "הפריט שלך מופיע כעת בעמוד הבית",
      });

      // Reset form
      setTitle('');
      setPrice('');
      setCategory('');
      setLocation('');
      setMobileNumber('');
      setSelectedImage(null);
      setSelectedFile(null);
      
      onClose();
    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת הפריט. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim() && category && location && mobileNumber.trim() && selectedImage;

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
            <label className="text-sm text-muted-foreground block text-right">מחיר (אופציונלי)</label>
            <Input 
              placeholder=""
              type="text"
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
                <SelectItem value="art">אמנות</SelectItem>
                <SelectItem value="secondhand">יד שנייה</SelectItem>
                <SelectItem value="business">עסק</SelectItem>
                <SelectItem value="event">אירוע</SelectItem>
                <SelectItem value="מוזמנים להצטרף">מוזמנים להצטרף</SelectItem>
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
              {isSubmitting ? 'שומר...' : 'שמור'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemPopup;