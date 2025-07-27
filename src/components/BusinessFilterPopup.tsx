import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface BusinessFilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const BusinessFilterPopup = ({ isOpen, onClose }: BusinessFilterPopupProps) => {
  const { toast } = useToast();
  const [businessTypes, setBusinessTypes] = useState({
    restaurant: false,
    cafe: false,
    retail: false,
    services: false,
    entertainment: false,
    health: false
  });
  const [locationFilter, setLocationFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  const handleBusinessTypeChange = (type: string, checked: boolean) => {
    setBusinessTypes(prev => ({
      ...prev,
      [type]: checked
    }));
  };

  const handleSave = () => {
    toast({
      title: "הפילטר נשמר!",
      description: "העסקים עודכנו בהתאם להעדפותיך",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header with una logo */}
        <div className="flex items-center justify-between p-4 pb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <span className="text-3xl font-bold font-nunito" style={{ color: '#BB31E9' }}>una</span>
            <div className="text-xs text-gray-500 mt-1">פילטר עסקים</div>
          </div>
          
          <div className="w-8 h-8"></div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-8">
          {/* Business Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 text-center">סוג עסק</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="restaurant"
                  checked={businessTypes.restaurant}
                  onCheckedChange={(checked) => handleBusinessTypeChange('restaurant', checked as boolean)}
                />
                <label htmlFor="restaurant" className="text-sm font-medium text-gray-700">מסעדה</label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="cafe"
                  checked={businessTypes.cafe}
                  onCheckedChange={(checked) => handleBusinessTypeChange('cafe', checked as boolean)}
                />
                <label htmlFor="cafe" className="text-sm font-medium text-gray-700">בית קפה</label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="retail"
                  checked={businessTypes.retail}
                  onCheckedChange={(checked) => handleBusinessTypeChange('retail', checked as boolean)}
                />
                <label htmlFor="retail" className="text-sm font-medium text-gray-700">קניות</label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="services"
                  checked={businessTypes.services}
                  onCheckedChange={(checked) => handleBusinessTypeChange('services', checked as boolean)}
                />
                <label htmlFor="services" className="text-sm font-medium text-gray-700">שירותים</label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="entertainment"
                  checked={businessTypes.entertainment}
                  onCheckedChange={(checked) => handleBusinessTypeChange('entertainment', checked as boolean)}
                />
                <label htmlFor="entertainment" className="text-sm font-medium text-gray-700">בידור</label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="health"
                  checked={businessTypes.health}
                  onCheckedChange={(checked) => handleBusinessTypeChange('health', checked as boolean)}
                />
                <label htmlFor="health" className="text-sm font-medium text-gray-700">בריאות</label>
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 text-center">מיקום</h3>
            <RadioGroup value={locationFilter} onValueChange={setLocationFilter} className="space-y-3">
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <RadioGroupItem value="all" id="all-location" />
                <Label htmlFor="all-location" className="text-sm font-medium text-gray-700">הכל</Label>
              </div>
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <RadioGroupItem value="nearby" id="nearby" />
                <Label htmlFor="nearby" className="text-sm font-medium text-gray-700">קרוב אלי</Label>
              </div>
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <RadioGroupItem value="walking" id="walking" />
                <Label htmlFor="walking" className="text-sm font-medium text-gray-700">הליכה</Label>
              </div>
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <RadioGroupItem value="driving" id="driving" />
                <Label htmlFor="driving" className="text-sm font-medium text-gray-700">נסיעה</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Price Filter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 text-center">טווח מחירים</h3>
            <RadioGroup value={priceFilter} onValueChange={setPriceFilter} className="space-y-3">
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <RadioGroupItem value="all" id="all-price" />
                <Label htmlFor="all-price" className="text-sm font-medium text-gray-700">הכל</Label>
              </div>
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <RadioGroupItem value="budget" id="budget" />
                <Label htmlFor="budget" className="text-sm font-medium text-gray-700">זול</Label>
              </div>
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate" className="text-sm font-medium text-gray-700">בינוני</Label>
              </div>
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <RadioGroupItem value="premium" id="premium" />
                <Label htmlFor="premium" className="text-sm font-medium text-gray-700">יקר</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Apply Button */}
          <div className="pt-4">
            <Button 
              onClick={handleSave}
              className="w-full h-12 text-white rounded-2xl text-lg font-medium"
              style={{ backgroundColor: '#BB31E9' }}
            >
              החל
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessFilterPopup;