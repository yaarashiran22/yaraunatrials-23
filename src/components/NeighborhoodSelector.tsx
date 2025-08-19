
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
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("תל אביב");

  const neighborhoods = [
    { name: "תל אביב", nameEn: "Tel Aviv", nameEs: "Tel Aviv" },
    { name: "פלורנטין", nameEn: "Florentin", nameEs: "Florentin" },
    { name: "נחלת בנימין", nameEn: "Nahalat Binyamin", nameEs: "Nahalat Binyamin" },
    { name: "שכונת מונטיפיורי", nameEn: "Montefiore", nameEs: "Montefiore" },
    { name: "יפו העתיקה", nameEn: "Old Jaffa", nameEs: "Jaffa Antigua" },
    { name: "נווה צדק", nameEn: "Neve Tzedek", nameEs: "Neve Tzedek" }
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
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <ChevronDown className="h-4 w-4" />
          <span className="text-sm">{getDisplayName(neighborhoods.find(n => n.name === selectedNeighborhood))}</span>
          <MapPin className="h-4 w-4 text-primary" />
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
