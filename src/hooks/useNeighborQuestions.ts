import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NeighborQuestion {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CreateQuestionData {
  content: string;
}

export const useNeighborQuestions = () => {
  const [questions, setQuestions] = useState<NeighborQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('neighbor_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching neighbor questions:', error);
        toast({
          title: "שגיאה",
          description: "שגיאה בטעינת השאלות",
          variant: "destructive",
        });
      } else {
        setQuestions(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת השאלות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (questionData: CreateQuestionData) => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר כדי לפרסם שאלה",
        variant: "destructive",
      });
      return false;
    }

    try {
      setCreating(true);
      
      const { data, error } = await supabase
        .from('neighbor_questions')
        .insert([
          {
            user_id: user.id,
            content: questionData.content,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating neighbor question:', error);
        toast({
          title: "שגיאה",
          description: "שגיאה בפרסום השאלה",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "הצלחה",
          description: "השאלה פורסמה בהצלחה",
        });
        
        // Add the new question to the beginning of the list
        setQuestions(prev => [data, ...prev]);
        return true;
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "שגיאה",
        description: "שגיאה בפרסום השאלה",
        variant: "destructive",
      });
      return false;
    } finally {
      setCreating(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר כדי למחוק שאלה",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('neighbor_questions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting neighbor question:', error);
        toast({
          title: "שגיאה",
          description: "שגיאה במחיקת השאלה",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "הצלחה",
          description: "השאלה נמחקה בהצלחה",
        });
        
        // Remove the question from the list
        setQuestions(prev => prev.filter(q => q.id !== id));
        return true;
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת השאלה",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return {
    questions,
    loading,
    creating,
    fetchQuestions,
    createQuestion,
    deleteQuestion,
  };
};