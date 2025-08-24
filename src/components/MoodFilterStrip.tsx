import { useState } from "react";
import { Button } from "@/components/ui/button";

const moodFilters = [
  { id: "all", label: "All", emoji: "🎯" },
  { id: "chill", label: "Chill", emoji: "😌" },
  { id: "go-out", label: "Go Out", emoji: "🎉" },
  { id: "active", label: "Active", emoji: "💪" },
  { id: "creative", label: "Creative", emoji: "🎨" },
  { id: "social", label: "Social", emoji: "👥" },
  { id: "explore", label: "Explore", emoji: "🔍" }
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
        <div className="flex overflow-x-auto gap-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
          {moodFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterClick(filter.id)}
              className={`
                flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200
                ${activeFilter === filter.id 
                  ? "bg-primary text-primary-foreground shadow-md scale-105" 
                  : "bg-background/60 hover:bg-accent hover:scale-105"
                }
              `}
            >
              <span className="mr-1.5">{filter.emoji}</span>
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodFilterStrip;