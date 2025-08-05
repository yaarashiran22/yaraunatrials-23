import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { useNeighborQuestionComments } from "@/hooks/useNeighborQuestionComments";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CommentProfile {
  id: string;
  name: string;
  profile_image_url?: string;
}

interface NeighborQuestionCommentsProps {
  questionId: string;
  onToggle?: () => void;
}

export const NeighborQuestionComments = ({ 
  questionId, 
  onToggle 
}: NeighborQuestionCommentsProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentProfiles, setCommentProfiles] = useState<{[key: string]: CommentProfile}>({});
  const { user } = useAuth();
  const { 
    comments, 
    loading, 
    creating, 
    fetchComments, 
    createComment, 
    deleteComment 
  } = useNeighborQuestionComments(questionId);

  // Fetch user profiles for comments
  useEffect(() => {
    const fetchCommentProfiles = async () => {
      if (comments.length === 0) return;

      const userIds = [...new Set(comments.map(c => c.user_id))];
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, profile_image_url')
          .in('id', userIds);

        if (error) {
          console.error('Error fetching comment profiles:', error);
        } else {
          const profilesMap = (data || []).reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as {[key: string]: CommentProfile});
          
          setCommentProfiles(profilesMap);
        }
      } catch (err) {
        console.error('Unexpected error fetching comment profiles:', err);
      }
    };

    if (showComments) {
      fetchCommentProfiles();
    }
  }, [comments, showComments]);

  const handleToggleComments = () => {
    const newShowState = !showComments;
    setShowComments(newShowState);
    if (onToggle) {
      onToggle();
    }
    if (newShowState && comments.length === 0) {
      fetchComments(questionId);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    const success = await createComment({ 
      content: commentText.trim(),
      question_id: questionId 
    });
    
    if (success) {
      setCommentText("");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "עכשיו";
    if (diffInHours === 1) return "לפני שעה";
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "אתמול";
    return `לפני ${diffInDays} ימים`;
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      {/* Comments Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleComments}
        className="flex items-center gap-2 p-0 h-auto text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm">
          {comments.length > 0 ? `${comments.length} תגובות` : 'הוסף תגובה'}
        </span>
      </Button>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 space-y-3">
          {/* Comments List */}
          {loading ? (
            <div className="text-center py-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {comments.map((comment) => {
                const userProfile = commentProfiles[comment.user_id];
                const isOwner = user?.id === comment.user_id;
                
                return (
                  <div key={comment.id} className="flex items-start gap-2 text-sm">
                    <img 
                      src={userProfile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                      alt={userProfile?.name || "משתמש"}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-xs">
                          {userProfile?.name || "משתמש"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(comment.created_at)}
                        </span>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-0 h-auto text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-foreground text-xs leading-relaxed break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              אין תגובות עדיין
            </p>
          )}

          {/* Add Comment Form */}
          {user && (
            <div className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="כתוב תגובה..."
                className="text-sm h-8"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <Button 
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || creating}
                size="sm"
                className="h-8 px-3"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {!user && (
            <p className="text-xs text-muted-foreground text-center py-2">
              התחבר כדי להגיב
            </p>
          )}
        </div>
      )}
    </div>
  );
};