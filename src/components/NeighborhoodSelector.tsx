
import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NeighborhoodSelector = () => {
  const { language } = useLanguage();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Palermo");

  const neighborhoods = [
    { name: "Palermo", nameEn: "Palermo", nameEs: "Palermo" },
    { name: "Palermo Soho", nameEn: "Palermo Soho", nameEs: "Palermo Soho" },
    { name: "Palermo Hollywood", nameEn: "Palermo Hollywood", nameEs: "Palermo Hollywood" },
    { name: "Recoleta", nameEn: "Recoleta", nameEs: "Recoleta" },
    { name: "San Telmo", nameEn: "San Telmo", nameEs: "San Telmo" },
    { name: "Puerto Madero", nameEn: "Puerto Madero", nameEs: "Puerto Madero" },
    { name: "Belgrano", nameEn: "Belgrano", nameEs: "Belgrano" },
    { name: "Villa Crespo", nameEn: "Villa Crespo", nameEs: "Villa Crespo" },
    { name: "La Boca", nameEn: "La Boca", nameEs: "La Boca" }
  ];

  const getDisplayName = (neighborhood: any) => {
    switch (language) {
      case 'en':
        return neighborhood.nameEn;
      case 'es':
        return neighborhood.nameEs;
      default:
        return neighborhood.name;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1 bg-accent text-accent-foreground hover:bg-accent/80">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{getDisplayName(neighborhoods.find(n => n.name === selectedNeighborhood))}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border shadow-lg">
        {neighborhoods.map((neighborhood) => (
          <DropdownMenuItem 
            key={neighborhood.name}
            onClick={() => setSelectedNeighborhood(neighborhood.name)}
            className={`cursor-pointer ${selectedNeighborhood === neighborhood.name ? 'bg-primary/10' : ''}`}
          >
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span>{getDisplayName(neighborhood)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NeighborhoodSelector;
