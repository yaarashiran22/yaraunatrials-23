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
import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NeighborhoodIndicator = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfile(user?.id);
  const { language } = useLanguage();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");

  const neighborhoods = useMemo(() => [
    { name: "Palermo", nameEn: "Palermo", nameEs: "Palermo" },
    { name: "Recoleta", nameEn: "Recoleta", nameEs: "Recoleta" },
    { name: "San Telmo", nameEn: "San Telmo", nameEs: "San Telmo" },
    { name: "La Boca", nameEn: "La Boca", nameEs: "La Boca" },
    { name: "Puerto Madero", nameEn: "Puerto Madero", nameEs: "Puerto Madero" },
    { name: "Villa Crespo", nameEn: "Villa Crespo", nameEs: "Villa Crespo" },
    { name: "Belgrano", nameEn: "Belgrano", nameEs: "Belgrano" },
    { name: "Caballito", nameEn: "Caballito", nameEs: "Caballito" }
  ], []);

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

  // Memoize current neighborhood calculation to prevent infinite re-renders
  const currentNeighborhood = useMemo(() => {
    if (selectedNeighborhood) return selectedNeighborhood;
    if (user && !loading && profile?.location) return profile.location;
    return "Palermo";
  }, [selectedNeighborhood, user, loading, profile?.location]);

  const currentNeighborhoodObj = useMemo(() => {
    return neighborhoods.find(n => n.name === currentNeighborhood) || neighborhoods[0];
  }, [neighborhoods, currentNeighborhood]);

  const displayName = useMemo(() => {
    return getDisplayName(currentNeighborhoodObj);
  }, [currentNeighborhoodObj, language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="lg" 
          className="flex items-center gap-2 text-foreground hover:text-foreground/80 bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-border/50 rounded-full px-6 py-3 shadow-sm transition-all duration-200"
        >
          <MapPin className="h-6 w-6 text-primary" />
          <span className="text-lg font-medium">{displayName}</span>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="bg-background/95 backdrop-blur-sm border shadow-xl z-50 min-w-[200px] rounded-xl p-2">
        {neighborhoods.map((neighborhood) => (
          <DropdownMenuItem 
            key={neighborhood.name}
            onClick={() => setSelectedNeighborhood(neighborhood.name)}
            className={`cursor-pointer rounded-lg p-3 transition-colors ${
              currentNeighborhood === neighborhood.name 
                ? 'bg-primary/15 text-primary font-medium' 
                : 'hover:bg-muted/50'
            }`}
          >
            <MapPin className="h-4 w-4 mr-3 text-primary" />
            <span className="text-sm font-medium">{getDisplayName(neighborhood)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NeighborhoodIndicator;