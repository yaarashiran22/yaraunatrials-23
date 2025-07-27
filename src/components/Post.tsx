import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostProps {
  userImage: string;
  userName: string;
  timeAgo: string;
  content: string | React.ReactNode;
  postImage?: string;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
}

const Post = ({ 
  userImage, 
  userName, 
  timeAgo, 
  content, 
  postImage, 
  likes = 0, 
  comments = 0, 
  isLiked = false 
}: PostProps) => {
  return (
    <div className="bg-card rounded-lg shadow-card p-4 mb-4">
      {/* Post Header */}
      <div className="flex items-center gap-3 mb-3">
        <img 
          src={userImage} 
          alt={userName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{userName}</h3>
          <p className="text-sm text-muted-foreground">{timeAgo}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-3">
        <p className="text-foreground mb-3">{content}</p>
        {postImage && (
          <div className="rounded-lg overflow-hidden aspect-square">
            <img 
              src={postImage} 
              alt="Post content"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <Button 
          variant="ghost" 
          size="sm"
          className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          {likes > 0 && <span className="text-sm">{likes}</span>}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <MessageCircle className="h-5 w-5" />
          {comments > 0 && <span className="text-sm">{comments}</span>}
        </Button>
      </div>
    </div>
  );
};

export default Post;