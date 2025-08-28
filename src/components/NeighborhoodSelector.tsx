import { MapPin } from "lucide-react";

interface NeighborhoodSelectorProps {
  onNeighborhoodChange?: (neighborhood: string) => void;
}

const NeighborhoodSelector = ({ onNeighborhoodChange }: NeighborhoodSelectorProps) => {
  return (
    <div className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg border border-accent">
      <MapPin className="h-4 w-4" />
      <span className="text-sm font-medium">Palermo</span>
    </div>
  );
};

export default NeighborhoodSelector;