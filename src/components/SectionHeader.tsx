
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
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-xl font-bold text-foreground relative">
          <span className="relative z-10 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-sm">
            {title}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/10 to-transparent blur-sm -z-10 transform translate-x-0.5 translate-y-0.5"></div>
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 relative">
            <span className="relative z-10 drop-shadow-sm">{subtitle}</span>
          </p>
        )}
      </div>
      {viewAllPath && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAll}
          className="text-primary hover:text-primary/80 gap-1 btn-3d relative overflow-hidden group"
        >
          <span className="relative z-10">All</span>
          <ChevronLeft className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Button>
      )}
    </div>
  );
};

export default SectionHeader;
