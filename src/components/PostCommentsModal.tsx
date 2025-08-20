import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Send } from 'lucide-react';
import { usePostComments } from '@/hooks/usePostComments';
import { useAuth } from '@/contexts/AuthContext';
import ProfilePictureViewer from './ProfilePictureViewer';

interface PostCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
}

export const PostCommentsModal = ({ isOpen, onClose, postId, postTitle }: PostCommentsModalProps) => {
  const { user } = useAuth();
  const { comments, commentsCount, loading, submitting, addComment, deleteComment } = usePostComments(postId);
  const [newComment, setNewComment] = useState('');
  const [showProfilePicture, setShowProfilePicture] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{imageUrl: string; name: string} | null>(null);

  const handleSubmitComment = async () => {
    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('האם למחוק את התגובה?')) {
      await deleteComment(commentId);
    }
  };

  const formatTimeAgo = (dateString: string) => {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            תגובות ({commentsCount})
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>אין תגובות עדיין</p>
              <p className="text-sm">היה הראשון להגיב!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-accent/30">
                <img 
                  src={comment.profiles?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                  alt={comment.profiles?.name || "משתמש"}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setSelectedUser({
                      imageUrl: comment.profiles?.profile_image_url || "",
                      name: comment.profiles?.name || "משתמש"
                    });
                    setShowProfilePicture(true);
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-sm">{comment.profiles?.name || "משתמש"}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                      {user?.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground mt-1 break-words">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {user && (
          <div className="border-t pt-4 space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="כתוב תגובה..."
              className="min-h-[80px] resize-none"
              disabled={submitting}
            />
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              className="w-full"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  פרסם תגובה
                </>
              )}
            </Button>
          </div>
        )}
        
        <ProfilePictureViewer
          isOpen={showProfilePicture}
          onClose={() => setShowProfilePicture(false)}
          imageUrl={selectedUser?.imageUrl || ""}
          userName={selectedUser?.name || "משתמש"}
        />
      </DialogContent>
    </Dialog>
  );
};