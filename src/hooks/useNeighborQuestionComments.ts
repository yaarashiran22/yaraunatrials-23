import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NeighborQuestionComment {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CreateCommentData {
  question_id: string;
  content: string;
}

export const useNeighborQuestionComments = (questionId?: string) => {
  const [comments, setComments] = useState<NeighborQuestionComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComments = async (qId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('neighbor_question_comments')
        .select('*')
        .eq('question_id', qId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: "שגיאה",
          description: "שגיאה בטעינת התגובות",
          variant: "destructive",
        });
      } else {
        setComments(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת התגובות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (commentData: CreateCommentData) => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר כדי להגיב",
        variant: "destructive",
      });
      return false;
    }

    try {
      setCreating(true);
      
      const { data, error } = await supabase
        .from('neighbor_question_comments')
        .insert([
          {
            question_id: commentData.question_id,
            user_id: user.id,
            content: commentData.content,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        toast({
          title: "שגיאה",
          description: "שגיאה בפרסום התגובה",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "הצלחה",
          description: "התגובה פורסמה בהצלחה",
        });
        
        // Add the new comment to the list
        setComments(prev => [...prev, data]);
        return true;
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "שגיאה",
        description: "שגיאה בפרסום התגובה",
        variant: "destructive",
      });
      return false;
    } finally {
      setCreating(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר כדי למחוק תגובה",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('neighbor_question_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting comment:', error);
        toast({
          title: "שגיאה",
          description: "שגיאה במחיקת התגובה",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "הצלחה",
          description: "התגובה נמחקה בהצלחה",
        });
        
        // Remove the comment from the list
        setComments(prev => prev.filter(c => c.id !== commentId));
        return true;
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת התגובה",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (questionId) {
      fetchComments(questionId);
    }
  }, [questionId]);

  return {
    comments,
    loading,
    creating,
    fetchComments,
    createComment,
    deleteComment,
  };
};