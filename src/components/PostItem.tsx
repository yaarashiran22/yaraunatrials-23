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
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
      {/* Media Hero - Maximum Emphasis */}
      {post.image && (
        <div className="relative group">
          <img 
            src={post.image} 
            alt="Post image" 
            className="w-full h-96 sm:h-[500px] object-cover hover-scale transition-transform duration-500"
          />
          
          {/* Engagement Overlay - Floating on Media */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-full px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 hover:bg-transparent group/like"
              onClick={toggleLike}
            >
              <Heart 
                className={`h-4 w-4 transition-all duration-200 ${
                  isLiked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-white/80 group-hover/like:text-red-400 group-hover/like:scale-110'
                }`} 
              />
            </Button>
            {likesCount > 0 && (
              <span className="text-xs text-white/90 font-medium">{likesCount}</span>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 hover:bg-transparent group/comment"
              onClick={() => onCommentsClick(post.id)}
            >
              <MessageCircle className="h-4 w-4 text-white/80 group-hover/comment:text-blue-400 group-hover/comment:scale-110 transition-all duration-200" />
            </Button>
            {commentsCount > 0 && (
              <span className="text-xs text-white/90 font-medium">{commentsCount}</span>
            )}
          </div>

          {/* User Info Overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-2">
            <img 
              src={post.userImage}
              alt={post.userName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-white/90 font-medium">{post.userName}</span>
            <span className="text-xs text-white/70">•</span>
            <span className="text-xs text-white/70">{post.timeAgo}</span>
          </div>

          {/* Delete Button */}
          {isOwner && (
            <div className="absolute top-4 right-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-black/40 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-black/60">
                    <MoreHorizontal className="h-4 w-4" />
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
            </div>
          )}
        </div>
      )}

      {post.video && (
        <div className="relative group">
          <video 
            src={post.video} 
            controls
            className="w-full h-96 sm:h-[500px] object-cover"
            preload="metadata"
          />
          
          {/* User Info Overlay for Video */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-2">
            <img 
              src={post.userImage}
              alt={post.userName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-white/90 font-medium">{post.userName}</span>
            <span className="text-xs text-white/70">•</span>
            <span className="text-xs text-white/70">{post.timeAgo}</span>
          </div>

          {/* Delete Button for Video */}
          {isOwner && (
            <div className="absolute top-4 right-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-black/40 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-black/60">
                    <MoreHorizontal className="h-4 w-4" />
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
            </div>
          )}

          {/* Engagement for Video - Bottom Right */}
          <div className="absolute bottom-4 right-4 flex flex-col items-center gap-3">
            <div className="flex flex-col items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 hover:bg-transparent group/like bg-black/40 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center"
                onClick={toggleLike}
              >
                <Heart 
                  className={`h-5 w-5 transition-all duration-200 ${
                    isLiked 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-white/80 group-hover/like:text-red-400 group-hover/like:scale-110'
                  }`} 
                />
              </Button>
              {likesCount > 0 && (
                <span className="text-xs text-white/90 font-bold mt-1">{likesCount}</span>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 hover:bg-transparent group/comment bg-black/40 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center"
                onClick={() => onCommentsClick(post.id)}
              >
                <MessageCircle className="h-5 w-5 text-white/80 group-hover/comment:text-blue-400 group-hover/comment:scale-110 transition-all duration-200" />
              </Button>
              {commentsCount > 0 && (
                <span className="text-xs text-white/90 font-bold mt-1">{commentsCount}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Section - Only for posts without media or when text is substantial */}
      {(post.content && (!hasMedia || post.content.length > 50)) && (
        <div className="p-4">
          {/* User Info for Text-Only Posts */}
          {!hasMedia && (
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
          )}
          
          {/* Text Content */}
          <p className={`leading-relaxed ${
            hasMedia 
              ? 'text-sm text-muted-foreground/80 px-1' 
              : 'text-base text-foreground mb-4'
          }`}>
            {post.content}
          </p>

          {/* Engagement for Text-Only Posts */}
          {!hasMedia && (
            <div className="flex items-center gap-6 pt-3 border-t border-border/30">
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
          )}
        </div>
      )}

      {/* Minimal caption for media posts with short text */}
      {hasMedia && post.content && post.content.length <= 50 && (
        <div className="px-4 pb-3">
          <p className="text-sm text-muted-foreground/70 text-center italic">
            {post.content}
          </p>
        </div>
      )}
    </div>
  );
};