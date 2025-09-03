import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useFriends } from "@/hooks/useFriends";
import { useState } from "react";
import ProfilePictureViewer from "./ProfilePictureViewer";

const FriendsProfileRow = () => {
  const navigate = useNavigate();
  const { friends, loading } = useFriends();
  const [showProfilePicture, setShowProfilePicture] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  const handleProfilePictureClick = (friend: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFriend(friend);
    setShowProfilePicture(true);
  };

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
      <h3 className="text-lg font-semibold mb-3">חברים ושכנים</h3>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {friends.map((friend) => (
          <div 
            key={friend.friend_id} 
            className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
            onClick={() => navigate(`/profile/${friend.friend_id}`)}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-[#BB31E9] p-0.5">
                <div 
                  className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-card cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => handleProfilePictureClick(friend, e)}
                >
                  <img 
                    src={friend.profiles?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"} 
                    alt={friend.profiles?.name || 'משתמש'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-foreground text-center max-w-[64px] truncate">
              {friend.profiles?.name || 'משתמש'}
            </span>
          </div>
        ))}
      </div>
      
      <ProfilePictureViewer
        isOpen={showProfilePicture}
        onClose={() => setShowProfilePicture(false)}
        imageUrl={selectedFriend?.profiles?.profile_image_url || ""}
        userName={selectedFriend?.profiles?.name || 'משתמש'}
        userId={selectedFriend?.friend_id}
      />
    </div>
  );
};

export default FriendsProfileRow;