
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllPath?: string;
}

const SectionHeader = ({ title, subtitle, viewAllPath }: SectionHeaderProps) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    if (viewAllPath) {
      navigate(viewAllPath);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mb-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {viewAllPath && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAll}
          className="text-primary hover:text-primary/80 gap-1 mt-2"
        >
          <span>הצג הכל</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SectionHeader;
