import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNeighborQuestionComments } from "@/hooks/useNeighborQuestionComments";
import { useAuth } from "@/contexts/AuthContext";

interface NeighborQuestionItemProps {
  question: {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
  };
  userProfile?: {
    name?: string;
    profile_image_url?: string;
  };
  getTimeAgo: (dateString: string) => string;
  questionProfiles: Record<string, any>;
}

export const NeighborQuestionItem = ({ 
  question, 
  userProfile, 
  getTimeAgo,
  questionProfiles 
}: NeighborQuestionItemProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { comments, loading, creating, createComment, fetchComments } = useNeighborQuestionComments(
    showComments ? question.id : undefined
  );
  const { user } = useAuth();

  const handleToggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      fetchComments(question.id);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    const success = await createComment({
      question_id: question.id,
      content: newComment.trim(),
    });
    
    if (success) {
      setNewComment("");
    }
  };

  return (
    <div className="flex-shrink-0 w-64 bg-white border border-border rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <img 
          src={userProfile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
          alt={userProfile?.name || "משתמש"}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm">
            {userProfile?.name || "משתמש"}
          </h4>
          <p className="text-xs text-muted-foreground">
            {getTimeAgo(question.created_at)}
          </p>
        </div>
      </div>
      
      <p className="text-sm text-foreground leading-relaxed break-words mb-3">
        {question.content}
      </p>

      {/* Comment toggle button */}
      <div className="flex items-center gap-2 mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleComments}
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4 ml-1" />
          {comments.length > 0 ? `${comments.length} תגובות` : "הגב"}
        </Button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-border/20 pt-3 mt-3">
          {/* Comment input for authenticated users */}
          {user && (
            <div className="mb-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="כתוב תגובה..."
                className="min-h-[60px] text-xs resize-none"
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || creating}
                size="sm"
                className="mt-2 h-7 text-xs"
              >
                <Send className="h-3 w-3 ml-1" />
                {creating ? "מפרסם..." : "פרסם"}
              </Button>
            </div>
          )}

          {/* Comments list */}
          {loading ? (
            <div className="text-center py-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments.map((comment) => {
                const commentUserProfile = questionProfiles[comment.user_id];
                return (
                  <div key={comment.id} className="bg-background/50 rounded-lg p-2">
                    <div className="flex items-start gap-2">
                      <img 
                        src={commentUserProfile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                        alt={commentUserProfile?.name || "משתמש"}
                        className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground">
                            {commentUserProfile?.name || "משתמש"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-foreground break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {comments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  אין תגובות עדיין
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};