import { X, Upload, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";
import NotificationsPopup from "@/components/NotificationsPopup";
import { useState, useEffect } from "react";
import { useItems } from "@/hooks/useItems";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  validateAndSanitizeText, 
  validatePrice, 
  validateImageFile, 
  containsInappropriateContent,
  CONTENT_LIMITS,
  canUserModifyItem
} from "@/utils/security";

const EditItemPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, requireAuth } = useSecureAuth();
  const { toast } = useToast();
  const { updateItem } = useItems();

  // Load existing item data
  useEffect(() => {
    const loadItem = async () => {
      if (!itemId || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', itemId)
          .single();

        if (error) throw error;

        // Verify user can edit this item
        if (!canUserModifyItem(user.id, data.user_id)) {
          toast({
            title: "שגיאת הרשאה",
            description: "אין לך הרשאה לערוך פריט זה",
            variant: "destructive",
          });
          navigate(-1);
          return;
        }

        // Populate form with existing data
        setTitle(data.title || '');
        setDescription(data.description || '');
        setPrice(data.price ? data.price.toString() : '');
        setCategory(data.category || '');
        setLocation(data.location || '');
        setMobileNumber(data.mobile_number || '');
        setSelectedImage(data.image_url || null);
        
      } catch (error) {
        console.error('Error loading item:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את הפריט",
          variant: "destructive",
        });
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [itemId, user, navigate, toast]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast({
          title: "שגיאה בקובץ",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!itemId) return;
    
    // Require authentication
    if (!requireAuth()) {
      return;
    }

    // Validate and sanitize inputs
    const titleValidation = validateAndSanitizeText(title, CONTENT_LIMITS.title, true);
    if (!titleValidation.isValid) {
      toast({
        title: "שגיאה בכותרת",
        description: titleValidation.error,
        variant: "destructive",
      });
      return;
    }

    const descValidation = validateAndSanitizeText(description, CONTENT_LIMITS.description);
    if (!descValidation.isValid) {
      toast({
        title: "שגיאה בתיאור",
        description: descValidation.error,
        variant: "destructive",
      });
      return;
    }

    const priceValidation = validatePrice(price);
    if (!priceValidation.isValid) {
      toast({
        title: "שגיאה במחיר",
        description: priceValidation.error,
        variant: "destructive",
      });
      return;
    }

    // Check for inappropriate content
    const contentToCheck = `${titleValidation.value} ${descValidation.value}`;
    if (containsInappropriateContent(contentToCheck)) {
      toast({
        title: "תוכן לא מתאים",
        description: "התוכן שהוזן מכיל מילים לא מתאימות",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update the item data with sanitized values
      const updateData = {
        title: titleValidation.value,
        description: descValidation.value || null,
        price: priceValidation.value || null,
        category: category || null,
        location: location || null,
        image_url: selectedImage || null,
        mobile_number: mobileNumber.trim() || null,
      };

      const result = await updateItem(itemId, updateData);
      
      if (result) {
        toast({
          title: "פריט עודכן בהצלחה!",
          description: "השינויים נשמרו",
        });
        navigate(-1); // Go back to previous page
      }
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בלתי צפויה",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20" dir="rtl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">טוען פריט...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Custom Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <Button variant="ghost" size="sm" onClick={() => setShowNotifications(true)}>
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">עריכת פריט</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black font-nunito" style={{ color: '#BB31E9', textShadow: '0 0 2px rgba(187, 49, 233, 0.5)' }}>una</div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <main className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground block text-right">כותרת</label>
            <Input 
              placeholder=""
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-12 text-right bg-background border border-border rounded-full"
            />
          </div>

          {/* Price Field */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground block text-right">מחיר</label>
            <Input 
              placeholder=""
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full h-12 text-right bg-background border border-border rounded-full"
            />
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground block text-right">קטגוריה</label>
            <Select dir="rtl" value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full h-12 text-right bg-background border border-border rounded-full">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="art">אמנות</SelectItem>
                <SelectItem value="secondhand">יד שנייה</SelectItem>
                <SelectItem value="business">עסק</SelectItem>
                <SelectItem value="event">אירוע</SelectItem>
                <SelectItem value="recommendation">מוזמנים להצטרף</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Field */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground block text-right">מיקום</label>
            <Select dir="rtl" value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full h-12 text-right bg-background border border-border rounded-full">
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

          {/* Description Field */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground block text-right">תיאור</label>
            <Textarea 
              placeholder=""
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] text-right bg-background border border-border rounded-3xl resize-none p-4"
            />
          </div>

          {/* Contact Mobile Number Field */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground block text-right">מספר נייד ליצירת קשר</label>
            <Input 
              placeholder=""
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full h-12 text-right bg-background border border-border rounded-full"
            />
          </div>

          {/* Add Image Button */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <Button 
              variant="outline"
              className="w-full h-12 bg-background border border-border rounded-full text-foreground hover:bg-muted/20"
            >
              <Upload className="h-4 w-4 ml-2" />
              {selectedImage ? 'שנה תמונה' : 'הוסף תמונה'}
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
              className="w-full h-12 rounded-full text-lg font-medium"
              style={{ backgroundColor: '#BB31E9' }}
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? 'שומר...' : 'שמור שינויים'}
            </Button>
          </div>
        </div>
      </main>
      
      <NotificationsPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <BottomNavigation />
    </div>
  );
};

export default EditItemPage;