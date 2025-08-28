import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface NeighborhoodSelectorProps {
  onNeighborhoodChange?: (neighborhood: string) => void;
}

const NEIGHBORHOODS = [
  { name: "Palermo", nameEn: "Palermo", nameEs: "Palermo" },
  { name: "Palermo Soho", nameEn: "Palermo Soho", nameEs: "Palermo Soho" },
  { name: "Palermo Hollywood", nameEn: "Palermo Hollywood", nameEs: "Palermo Hollywood" },
  { name: "Recoleta", nameEn: "Recoleta", nameEs: "Recoleta" },
  { name: "Villa Crespo", nameEn: "Villa Crespo", nameEs: "Villa Crespo" }
];

const NeighborhoodSelector = ({ onNeighborhoodChange }: NeighborhoodSelectorProps) => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Palermo");

  const handleNeighborhoodSelect = (neighborhoodName: string) => {
    setSelectedNeighborhood(neighborhoodName);
    onNeighborhoodChange?.(neighborhoodName);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1 bg-accent text-accent-foreground hover:bg-accent/80">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{selectedNeighborhood}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50 relative">
        {NEIGHBORHOODS.map((neighborhood) => (
          <DropdownMenuItem 
            key={neighborhood.name}
            onClick={() => handleNeighborhoodSelect(neighborhood.name)}
            className={`cursor-pointer ${selectedNeighborhood === neighborhood.name ? 'bg-primary/10' : ''}`}
          >
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span>{neighborhood.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NeighborhoodSelector;