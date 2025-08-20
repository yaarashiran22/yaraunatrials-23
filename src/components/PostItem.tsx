import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePostLikes } from "@/hooks/usePostLikes";
import { usePostComments } from "@/hooks/usePostComments";
import { useAuth } from "@/contexts/AuthContext";

interface PostItemProps {
  post: {
    id: string;
    userId: string;
    userImage: string;
    userName: string;
    tag: string;
    timeAgo: string;
    content: string;
    image?: string;
    video?: string;
  };
  onCommentsClick: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export const PostItem = ({ post, onCommentsClick, onDelete }: PostItemProps) => {
  const { user } = useAuth();
  const { likesCount, isLiked, toggleLike } = usePostLikes(post.id);
  const { commentsCount } = usePostComments(post.id);

  const handleDelete = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הפוסט?')) {
      onDelete?.(post.id);
    }
  };

  const isOwner = user?.id === post.userId;
  const hasMedia = post.image || post.video;

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in">
      {/* Media First - Hero Section */}
      {post.image && (
        <div className="relative group">
          <img 
            src={post.image} 
            alt="Post image" 
            className="w-full h-80 object-cover hover-scale transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {post.video && (
        <div className="relative group">
          <video 
            src={post.video} 
            controls
            className="w-full h-80 object-cover rounded-none"
            preload="metadata"
          />
        </div>
      )}

      {/* Content Section */}
      <div className="p-4">
        {/* User Info - Compact */}
        <div className="flex items-center gap-3 mb-3">
          <img 
            src={post.userImage}
            alt={post.userName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm text-foreground truncate">{post.userName}</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {post.tag}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-60 hover:opacity-100">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  מחק פוסט
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Text Content - Subtle when media is present */}
        {post.content && (
          <p className={`leading-relaxed mb-4 ${
            hasMedia 
              ? 'text-sm text-muted-foreground/80' 
              : 'text-base text-foreground'
          }`}>
            {post.content}
          </p>
        )}
      
        {/* Engagement Bar */}
        <div className="flex items-center gap-6 pt-2 border-t border-border/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 p-0 hover:bg-transparent group"
            onClick={toggleLike}
          >
            <Heart 
              className={`h-5 w-5 transition-all duration-200 ${
                isLiked 
                  ? 'fill-red-500 text-red-500 scale-110' 
                  : 'text-muted-foreground group-hover:text-red-500 group-hover:scale-105'
              }`} 
            />
            {likesCount > 0 && (
              <span className="text-sm text-muted-foreground font-medium">{likesCount}</span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 p-0 hover:bg-transparent group"
            onClick={() => onCommentsClick(post.id)}
          >
            <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:scale-105 transition-all duration-200" />
            {commentsCount > 0 && (
              <span className="text-sm text-muted-foreground font-medium">{commentsCount}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};