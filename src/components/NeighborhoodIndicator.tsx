import { MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const NeighborhoodIndicator = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfile(user?.id);

  if (!user || loading) {
    return null;
  }

  const neighborhood = profile?.location || "לא נבחר";

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <MapPin className="h-4 w-4" />
      <span className="hidden sm:inline">{neighborhood}</span>
      <span className="sm:hidden">{neighborhood.length > 10 ? neighborhood.substring(0, 10) + "..." : neighborhood}</span>
    </div>
  );
};

export default NeighborhoodIndicator;