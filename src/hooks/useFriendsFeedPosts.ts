import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FriendsFeedPost {
  id: string;
  user_id: string;
  content?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    profile_image_url?: string;
  };
}

export const useFriendsFeedPosts = () => {
  const [posts, setPosts] = useState<FriendsFeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchFriendsFeedPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First get the posts
      const { data: postsData, error: postsError } = await supabase
        .from('friends_feed_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Then get the profiles for these posts
      if (postsData && postsData.length > 0) {
        const userIds = postsData.map(post => post.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, profile_image_url')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const postsWithProfiles = postsData.map(post => ({
          ...post,
          profiles: profilesData?.find(profile => profile.id === post.user_id)
        }));

        setPosts(postsWithProfiles);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching friends feed posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content?: string, imageUrl?: string) => {
    if (!user) return null;

    try {
      const { data: postData, error: postError } = await supabase
        .from('friends_feed_posts')
        .insert({
          user_id: user.id,
          content,
          image_url: imageUrl
        })
        .select('*')
        .single();

      if (postError) throw postError;

      // Get the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, profile_image_url')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const newPost = {
        ...postData,
        profiles: profileData
      };
      
      // Add the new post to the beginning of the list
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (error) {
      console.error('Error creating friends feed post:', error);
      return null;
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friends_feed_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Remove the post from the list
      setPosts(prev => prev.filter(post => post.id !== postId));
      return true;
    } catch (error) {
      console.error('Error deleting friends feed post:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchFriendsFeedPosts();
  }, [user]);

  return {
    posts,
    loading,
    createPost,
    deletePost,
    refreshPosts: fetchFriendsFeedPosts
  };
};