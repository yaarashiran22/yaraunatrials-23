import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NeighborQuestionComment {
  id: string;
  user_id: string;
  question_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CreateCommentData {
  content: string;
  question_id: string;
}

export const useNeighborQuestionComments = (questionId?: string) => {
  const [comments, setComments] = useState<NeighborQuestionComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComments = async (targetQuestionId?: string) => {
    const queryQuestionId = targetQuestionId || questionId;
    if (!queryQuestionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('neighbor_question_comments')
        .select('*')
        .eq('question_id', queryQuestionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching neighbor question comments:', error);
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
            user_id: user.id,
            question_id: commentData.question_id,
            content: commentData.content,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating neighbor question comment:', error);
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
        
        // Add the new comment to the end of the list
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

  const deleteComment = async (id: string) => {
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
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting neighbor question comment:', error);
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
        setComments(prev => prev.filter(c => c.id !== id));
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