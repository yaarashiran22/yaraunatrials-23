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
        className={`relative bg-card rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 group w-full cursor-pointer border-2 border-dashed border-primary/30 hover:border-primary/50 ${className}`}
        onClick={handleClick}
      >
        <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary/80">Add Recommendation</span>
          </div>
        </div>
        
        <div className="p-3 h-20 flex flex-col justify-center">
          <div className="text-center">
            <h3 className="font-semibold text-foreground text-sm">New Place</h3>
            <p className="text-xs text-muted-foreground">Click to add</p>
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