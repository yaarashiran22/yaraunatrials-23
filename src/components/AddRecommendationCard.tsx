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
        className={`relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border border-primary/20 bg-transparent hover:bg-accent/10 ${className}`}
        onClick={handleClick}
      >
        <div className="h-9 flex items-center justify-center px-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-4 h-4 text-foreground" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground text-xs">Add Buzz</h3>
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