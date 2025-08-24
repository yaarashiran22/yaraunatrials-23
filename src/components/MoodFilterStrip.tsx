import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Coffee, Zap, Heart, Dumbbell, Palette, Users, Search } from "lucide-react";

const moodFilters = [
  { id: "all", label: "All", icon: Search },
  { id: "chill", label: "Chill", icon: Coffee },
  { id: "go-out", label: "Go Out", icon: Zap },
  { id: "romantic", label: "Romantic", icon: Heart },
  { id: "active", label: "Active", icon: Dumbbell },
  { id: "creative", label: "Creative", icon: Palette },
  { id: "social", label: "Social", icon: Users }
];

interface MoodFilterStripProps {
  onFilterChange?: (filterId: string) => void;
}

const MoodFilterStrip = ({ onFilterChange }: MoodFilterStripProps) => {
  const [activeFilter, setActiveFilter] = useState("all");

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
    onFilterChange?.(filterId);
  };

  return (
    <div className="sticky top-[var(--header-height,64px)] z-20 bg-background/95 backdrop-blur-sm border-b border-border/20">
      <div className="px-4 lg:px-8 py-3">
        <div className="flex overflow-x-auto gap-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
          {moodFilters.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <Button
                key={filter.id}
                variant="ghost"
                size="sm"
                onClick={() => handleFilterClick(filter.id)}
                className={`
                  flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 
                  flex items-center gap-2 min-w-fit
                  ${activeFilter === filter.id 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }
                `}
              >
                <IconComponent className="h-4 w-4" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MoodFilterStrip;