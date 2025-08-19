import { X, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNewItem } from "@/contexts/NewItemContext";
import { useUserMessages } from "@/hooks/useUserMessages";

interface NewItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated?: () => void;
}

const NewItemPopup = ({ isOpen, onClose, onItemCreated }: NewItemPopupProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signInAnonymously } = useAuth();
  const { toast } = useToast();
  const { refreshItems } = useNewItem();
  const { createMessage } = useUserMessages();

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

  const handleSubmit = async () => {
    console.log('Save button clicked in popup');
    
    // Require title for item creation
    if (!title.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין כותרת",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let currentUser = user;
      
      // If no user, sign in anonymously
      if (!currentUser) {
        console.log('No user found, signing in anonymously...');
        toast({
          title: "מתחבר למערכת...",
          description: "מתחבר אוטומטית כדי לשמור את הפריט",
        });
        
        const { error: authError } = await signInAnonymously();
        if (authError) {
          console.error('Auth error:', authError);
          toast({
            title: "שגיאת התחברות",
            description: "לא ניתן להתחבר למערכת",
            variant: "destructive",
          });
          return;
        }
        
        // Wait for auth state to update and get the session
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: { session } } = await supabase.auth.getSession();
        currentUser = session?.user || null;
        
        if (!currentUser) {
          toast({
            title: "שגיאה",
            description: "לא ניתן להתחבר למערכת",
            variant: "destructive",
          });
          return;
        }
      }

      // Create the item data
      const itemData = {
        title: title.trim(),
        description: description.trim() || null,
        price: price ? parseFloat(price) : null,
        category: category || null,
        location: location || null,
        image_url: selectedImage || null,
        mobile_number: mobileNumber.trim() || null,
        user_id: currentUser.id,
        status: 'active'
      };

      console.log('Creating item with data:', itemData);

      // Insert into database
      const { data, error } = await supabase
        .from('items')
        .insert([itemData])
        .select()
        .single();

      console.log('Database insert result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לשמור את הפריט במסד הנתונים",
          variant: "destructive",
        });
        return;
      }
      console.log('Item created successfully:', data);

      toast({
        title: "נשמר בהצלחה!",
        description: "הפריט שלך נוסף למרקט פליס",
      });

      // Trigger refresh on the homepage
      refreshItems();
      if (onItemCreated) {
        onItemCreated();
      }

      // Reset form and close popup
      setTitle('');
      setPrice('');
      setCategory('');
      setLocation('');
      setDescription('');
      setMobileNumber('');
      setSelectedImage(null);
      onClose();
      
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="w-full max-w-md bg-background rounded-3xl max-h-[90vh] overflow-hidden mx-4" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">פריט חדש</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black font-nunito" style={{ color: '#BB31E9', textShadow: '0 0 2px rgba(187, 49, 233, 0.5)' }}>una</div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
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
                <SelectItem value="event">אירוע</SelectItem>
                <SelectItem value="מוזמנים להצטרף">מוזמנים להצטרף</SelectItem>
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
              className="w-full h-12 rounded-full text-lg font-medium text-white"
              style={{ backgroundColor: '#BB31E9' }}
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? 'שומר...' : 'שמור'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewItemPopup;