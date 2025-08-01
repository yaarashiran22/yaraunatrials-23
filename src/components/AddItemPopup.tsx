import { X, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NeighborhoodSelector from "@/components/NeighborhoodSelector";
import { useState } from "react";

interface AddItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemPopup = ({ isOpen, onClose }: AddItemPopupProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
            <NeighborhoodSelector />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black font-nunito" style={{ color: '#BB31E9', textShadow: '0 0 2px rgba(187, 49, 233, 0.5)' }}>una</div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
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
              className="w-full h-11 text-right bg-background border border-border rounded-full px-4"
            />
          </div>

          {/* Price Field */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground block text-right">מחיר</label>
            <Input 
              placeholder=""
              type="text"
              className="w-full h-11 text-right bg-background border border-border rounded-full px-4"
            />
          </div>

          {/* Category Field */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground block text-right">קטגוריה</label>
            <Select dir="rtl">
              <SelectTrigger className="w-full h-11 text-right bg-background border border-border rounded-full px-4">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
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
            <Select dir="rtl">
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


          {/* Description Field */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground block text-right">תמונה</label>
            <Input 
              placeholder=""
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
              className="w-full h-11 rounded-full text-lg font-medium text-white"
              style={{ backgroundColor: '#BB31E9' }}
              onClick={() => {
                console.log('Form submitted');
                onClose();
              }}
            >
              שמור
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemPopup;