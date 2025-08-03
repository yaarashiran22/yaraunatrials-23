import { MapPin, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NeighborhoodIndicator = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfile(user?.id);
  const { language } = useLanguage();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");

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

  // For non-authenticated users, use default neighborhood or selected one
  const currentNeighborhood = selectedNeighborhood || (user && !loading ? profile?.location : null) || "תל אביב";
  const currentNeighborhoodObj = neighborhoods.find(n => n.name === currentNeighborhood) || neighborhoods[0];
  const displayName = getDisplayName(currentNeighborhoodObj);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">{displayName}</span>
          <span className="sm:hidden text-sm">{displayName.length > 10 ? displayName.substring(0, 10) + "..." : displayName}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
        {neighborhoods.map((neighborhood) => (
          <DropdownMenuItem 
            key={neighborhood.name}
            onClick={() => setSelectedNeighborhood(neighborhood.name)}
            className={`cursor-pointer ${currentNeighborhood === neighborhood.name ? 'bg-primary/10' : ''}`}
          >
            <MapPin className="h-4 w-4 mr-2" />
            <span>{getDisplayName(neighborhood)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NeighborhoodIndicator;