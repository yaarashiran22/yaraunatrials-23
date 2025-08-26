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
        className={`relative rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 group cursor-pointer border-2 border-orange-400 bg-background hover:bg-accent hover:text-accent-foreground ${className}`}
        onClick={handleClick}
      >
        <div className="h-9 flex items-center justify-center px-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-4 h-4 text-foreground" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground text-xs">Recommend</h3>
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