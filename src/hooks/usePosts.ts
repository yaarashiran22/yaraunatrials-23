import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePostData {
  content: string;
  image_url?: string;
  location?: string;
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user, signInAnonymously } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as Post[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את הפוסטים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: CreatePostData) => {
    console.log('createPost called with:', postData);
    
    try {
      setCreating(true);
      let currentUser = user;
      
      // If no user, sign in anonymously
      if (!currentUser) {
        console.log('No user found, signing in anonymously...');
        toast({
          title: "מתחבר למערכת...",
          description: "מתחבר אוטומטית כדי לשמור את הפוסט",
        });
        
        const { error: authError } = await signInAnonymously();
        if (authError) {
          console.error('Auth error:', authError);
          toast({
            title: "שגיאת התחברות",
            description: "לא ניתן להתחבר למערכת",
            variant: "destructive",
          });
          return null;
        }
        
        // Wait for auth state to update and get the session
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: { session } } = await supabase.auth.getSession();
        currentUser = session?.user || null;
        
        if (!currentUser) {
          toast({
            title: "שגיאה",
            description: "לא ניתן להתחבר למערכת",
            variant: "destructive",
          });
          return null;
        }
      }

      console.log('Creating post with user:', currentUser.id);
      
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          ...postData,
          user_id: currentUser.id
        }])
        .select()
        .single();

      console.log('Supabase insert result:', { data, error });

      if (error) throw error;

      toast({
        title: "פוסט נוצר בהצלחה!",
        description: "הפוסט שלך נוסף לפיד הקהילה",
      });

      // Refresh posts list
      fetchPosts();
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור את הפוסט",
        variant: "destructive",
      });
      return null;
    } finally {
      setCreating(false);
    }
  };

  const updatePost = async (id: string, updates: Partial<CreatePostData>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "פוסט עודכן",
        description: "הפוסט עודכן בהצלחה",
      });

      fetchPosts();
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את הפוסט",
        variant: "destructive",
      });
      return null;
    }
  };

  const deletePost = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "פוסט נמחק",
        description: "הפוסט נמחק בהצלחה",
      });

      fetchPosts();
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את הפוסט",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    creating,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
  };
};