import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useFriends } from "@/hooks/useFriends";

const FriendsProfileRow = () => {
  const navigate = useNavigate();
  const { friends, loading } = useFriends();

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mb-2"></div>
            <div className="w-12 h-3 bg-gray-200 animate-pulse rounded mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">החברים שלי</h3>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {friends.map((friend) => (
          <div 
            key={friend.id} 
            className="flex-shrink-0 text-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/profile/${friend.id}`)}
          >
            <Avatar className="w-16 h-16 mx-auto mb-2 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
              <AvatarImage 
                src={friend.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"} 
                alt={friend.name || 'משתמש'} 
              />
              <AvatarFallback className="text-sm font-medium">
                {friend.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-foreground font-medium block max-w-[64px] truncate">
              {friend.name || 'משתמש'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsProfileRow;