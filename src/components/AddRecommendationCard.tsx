import { Plus } from "lucide-react";
import { useState } from "react";
import AddRecommendationPopup from "./AddRecommendationPopup";

interface AddRecommendationCardProps {
  className?: string;
  onRecommendationAdded?: () => void;
}

const AddRecommendationCard = ({ className = "", onRecommendationAdded }: AddRecommendationCardProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleClick = () => {
    setIsPopupOpen(true);
  };

  const handleRecommendationAdded = () => {
    onRecommendationAdded?.();
  };

  return (
    <>
      <div 
        className={`relative rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 group cursor-pointer border border-orange-200 hover:border-orange-300 ${className}`}
        onClick={handleClick}
        style={{ backgroundColor: '#FF8F70' }}
      >
        <div className="h-16 flex items-center justify-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white text-sm">Add Recommendation</h3>
              <p className="text-xs text-white/90">Double-click to pin</p>
            </div>
          </div>
        </div>
      </div>
      
      <AddRecommendationPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onRecommendationAdded={handleRecommendationAdded}
      />
    </>
  );
};

export default AddRecommendationCard;