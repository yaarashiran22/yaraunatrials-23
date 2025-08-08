interface DailyPhotoCardProps {
  images: string[];
  userName: string;
  userAvatar?: string;
}

const DailyPhotoCard = ({ images, userName, userAvatar }: DailyPhotoCardProps) => {
  const primaryImage = images[0]; // Use the first image as primary
  
  return (
    <div className="flex-shrink-0 w-28 h-32">
      <div className="relative rounded-lg overflow-hidden h-full">
        <img 
          src={primaryImage} 
          alt={`Daily photo by ${userName}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-300">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs text-primary font-medium">
                    {userName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-white font-medium truncate">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPhotoCard;