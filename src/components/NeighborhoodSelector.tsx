
import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface NeighborhoodSelectorProps {
  onNeighborhoodChange?: (neighborhood: string) => void;
}

const NeighborhoodSelector = ({ onNeighborhoodChange }: NeighborhoodSelectorProps) => {
  const { language } = useLanguage();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Palermo");

  const neighborhoods = useMemo(() => [
    { name: "Palermo", nameEn: "Palermo", nameEs: "Palermo" },
    { name: "Palermo Soho", nameEn: "Palermo Soho", nameEs: "Palermo Soho" },
    { name: "Palermo Hollywood", nameEn: "Palermo Hollywood", nameEs: "Palermo Hollywood" },
    { name: "Recoleta", nameEn: "Recoleta", nameEs: "Recoleta" },
    { name: "Villa Crespo", nameEn: "Villa Crespo", nameEs: "Villa Crespo" }
  ], []);

  const getDisplayName = useCallback((neighborhood: any) => {
    if (!neighborhood) return 'Palermo';
    switch (language) {
      case 'en':
        return neighborhood.nameEn || neighborhood.name;
      case 'es':
        return neighborhood.nameEs || neighborhood.name;
      default:
        return neighborhood.name;
    }
  }, [language]);

  const selectedNeighborhoodObj = useMemo(() => 
    neighborhoods.find(n => n.name === selectedNeighborhood) || neighborhoods[0], 
    [neighborhoods, selectedNeighborhood]
  );

  const displayName = useMemo(() => 
    getDisplayName(selectedNeighborhoodObj), 
    [getDisplayName, selectedNeighborhoodObj]
  );

  // Memoize display names for all neighborhoods to prevent re-renders
  const neighborhoodDisplayNames = useMemo(() => {
    return neighborhoods.map(neighborhood => ({
      ...neighborhood,
      displayName: getDisplayName(neighborhood)
    }));
  }, [neighborhoods, getDisplayName]);

  const handleNeighborhoodSelect = useCallback((neighborhoodName: string) => {
    setSelectedNeighborhood(neighborhoodName);
    onNeighborhoodChange?.(neighborhoodName);
  }, [onNeighborhoodChange]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1 bg-accent text-accent-foreground hover:bg-accent/80">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{displayName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50 relative">
        {neighborhoodDisplayNames.map((neighborhood) => (
          <DropdownMenuItem 
            key={neighborhood.name}
            onClick={() => handleNeighborhoodSelect(neighborhood.name)}
            className={`cursor-pointer ${selectedNeighborhood === neighborhood.name ? 'bg-primary/10' : ''}`}
          >
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span>{neighborhood.displayName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NeighborhoodSelector;
