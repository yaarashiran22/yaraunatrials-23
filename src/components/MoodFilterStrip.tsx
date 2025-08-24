import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Coffee, Zap, Heart, Dumbbell, Palette, Users, Search } from "lucide-react";

const moodFilters = [
  { id: "all", label: "All", icon: Search, color: "text-muted-foreground", activeBg: "bg-muted/80" },
  { id: "chill", label: "Chill", icon: Coffee, color: "text-blue-500", activeBg: "bg-blue-50 dark:bg-blue-950/30" },
  { id: "go-out", label: "Go Out", icon: Zap, color: "text-orange-500", activeBg: "bg-orange-50 dark:bg-orange-950/30" },
  { id: "romantic", label: "Romantic", icon: Heart, color: "text-pink-500", activeBg: "bg-pink-50 dark:bg-pink-950/30" },
  { id: "active", label: "Active", icon: Dumbbell, color: "text-green-500", activeBg: "bg-green-50 dark:bg-green-950/30" },
  { id: "creative", label: "Creative", icon: Palette, color: "text-purple-500", activeBg: "bg-purple-50 dark:bg-purple-950/30" },
  { id: "social", label: "Social", icon: Users, color: "text-indigo-500", activeBg: "bg-indigo-50 dark:bg-indigo-950/30" }
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
                  flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 
                  flex items-center gap-2 min-w-fit border border-transparent
                  ${activeFilter === filter.id 
                    ? `${filter.activeBg} ${filter.color} border-current/20` 
                    : `${filter.color} hover:bg-accent/50`
                  }
                `}
              >
                <IconComponent className={`h-4 w-4 ${filter.color}`} />
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