import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import { usePostLikes } from "@/hooks/usePostLikes";
import { usePostComments } from "@/hooks/usePostComments";

interface PostItemProps {
  post: {
    id: string;
    userImage: string;
    userName: string;
    tag: string;
    timeAgo: string;
    content: string;
    image?: string;
  };
  onCommentsClick: (postId: string) => void;
}

export const PostItem = ({ post, onCommentsClick }: PostItemProps) => {
  const { likesCount, isLiked, toggleLike } = usePostLikes(post.id);
  const { commentsCount } = usePostComments(post.id);

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <img 
          src={post.userImage}
          alt={post.userName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{post.userName}</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {post.tag}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{post.timeAgo}</p>
        </div>
      </div>
        
      <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>
      
      {post.image && (
        <div className="mb-4">
          <img 
            src={post.image} 
            alt="Post image" 
            className="w-full max-h-96 object-cover rounded-lg"
          />
        </div>
      )}
    
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 p-0 hover:bg-transparent"
          onClick={toggleLike}
        >
          <Heart 
            className={`h-5 w-5 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`} 
          />
          <span className="text-sm text-muted-foreground">{likesCount}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 p-0 hover:bg-transparent"
          onClick={() => onCommentsClick(post.id)}
        >
          <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-primary" />
          <span className="text-sm text-muted-foreground">{commentsCount}</span>
        </Button>
      </div>
    </div>
  );
};