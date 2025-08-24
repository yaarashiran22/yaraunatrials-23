import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface MoodFilterStripProps {
  onFilterChange?: (filter: string) => void;
}

const MoodFilterStrip = ({ onFilterChange }: MoodFilterStripProps) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const moodFilters = [
    { id: "all", label: "All", emoji: "✨" },
    { id: "chill", label: "Chill", emoji: "😌" },
    { id: "go-out", label: "Go Out", emoji: "🎉" },
    { id: "active", label: "Active", emoji: "💪" },
    { id: "creative", label: "Creative", emoji: "🎨" },
    { id: "social", label: "Social", emoji: "👥" },
    { id: "explore", label: "Explore", emoji: "🗺️" },
  ];

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
    onFilterChange?.(filterId);
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border-b border-border/20 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
          {moodFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "ghost"}
              size="sm"
              onClick={() => handleFilterClick(filter.id)}
              className={`flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                activeFilter === filter.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span className="text-base">{filter.emoji}</span>
              <span className="text-sm font-medium">{filter.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodFilterStrip;