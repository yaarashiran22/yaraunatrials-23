import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterPopup = ({ isOpen, onClose }: FilterPopupProps) => {
  const { toast } = useToast();
  const [priceRange, setPriceRange] = useState([50, 500]);
  const [distance, setDistance] = useState([2]);
  const [categories, setCategories] = useState({
    women: false,
    men: false,
    vintage: false,
    home: false,
    clothing: false,
    sports: false
  });

  const handleCategoryChange = (category: string, checked: boolean) => {
    setCategories(prev => ({
      ...prev,
      [category]: checked
    }));
  };

  const handleSave = () => {
    toast({
      title: "הפילטר נשמר!",
      description: "התוצאות עודכנו בהתאם להעדפותיך",
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
            <div className="text-xs text-gray-500 mt-1">פילטר</div>
          </div>
          
          <div className="w-8 h-8"></div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-8">
          {/* Price Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 text-center">טווח מחירים</h3>
            <div className="px-4">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>₪{priceRange[0]}</span>
                <span>₪{priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 text-center">מרחק</h3>
            <div className="px-4">
              <Slider
                value={distance}
                onValueChange={setDistance}
                max={10}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0 ק"מ</span>
                <span>{distance[0]} ק"מ</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="women"
                  checked={categories.women}
                  onCheckedChange={(checked) => handleCategoryChange('women', checked as boolean)}
                />
                <label htmlFor="women" className="text-sm font-medium text-gray-700">
                  נשים
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="men"
                  checked={categories.men}
                  onCheckedChange={(checked) => handleCategoryChange('men', checked as boolean)}
                />
                <label htmlFor="men" className="text-sm font-medium text-gray-700">
                  גברים
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="vintage"
                  checked={categories.vintage}
                  onCheckedChange={(checked) => handleCategoryChange('vintage', checked as boolean)}
                />
                <label htmlFor="vintage" className="text-sm font-medium text-gray-700">
                  וינטג׳
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="sports"
                  checked={categories.sports}
                  onCheckedChange={(checked) => handleCategoryChange('sports', checked as boolean)}
                />
                <label htmlFor="sports" className="text-sm font-medium text-gray-700">
                  ספורט
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="clothing"
                  checked={categories.clothing}
                  onCheckedChange={(checked) => handleCategoryChange('clothing', checked as boolean)}
                />
                <label htmlFor="clothing" className="text-sm font-medium text-gray-700">
                  לבוש
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="home"
                  checked={categories.home}
                  onCheckedChange={(checked) => handleCategoryChange('home', checked as boolean)}
                />
                <label htmlFor="home" className="text-sm font-medium text-gray-700">
                  בית
                </label>
              </div>
            </div>
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

export default FilterPopup;