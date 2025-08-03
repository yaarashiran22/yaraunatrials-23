import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFriends = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('user_friends')
        .select(`
          friend_id,
          profiles:friend_id (
            id,
            name,
            username,
            profile_image_url,
            bio
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching friends:', error);
        return;
      }

      setFriends(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "שגיאה",
          description: "עליך להתחבר כדי להוסיף חברים",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('user_friends')
        .insert({
          user_id: user.id,
          friend_id: friendId
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "המשתמש כבר ברשימת החברים",
            variant: "destructive",
          });
        } else {
          toast({
            title: "שגיאה בהוספת חבר",
            description: "אנא נסה שוב",
            variant: "destructive",
          });
        }
        return false;
      }

      toast({
        title: "החבר נוסף בהצלחה!",
      });

      fetchFriends(); // Refresh the friends list
      return true;
    } catch (error) {
      console.error('Error adding friend:', error);
      toast({
        title: "שגיאה בהוספת חבר",
        description: "אנא נסה שוב",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { error } = await supabase
        .from('user_friends')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendId);

      if (error) {
        toast({
          title: "שגיאה בהסרת חבר",
          description: "אנא נסה שוב",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "החבר הוסר בהצלחה",
      });

      fetchFriends(); // Refresh the friends list
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      return false;
    }
  };

  const isFriend = (friendId: string) => {
    return friends.some(friend => friend.friend_id === friendId);
  };

  const getFriendItems = async (friendId: string) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', friendId)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching friend items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  /**
   * Get all friends' items organized by category
   */
  const getAllFriendsItemsByCategory = async () => {
    const categories: { [category: string]: any[] } = {};
    
    for (const friend of friends) {
      const items = await getFriendItems(friend.friend_id);
      
      items.forEach(item => {
        const category = item.category || 'other';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push({
          ...item,
          uploader: friend.profiles
        });
      });
    }
    
    return categories;
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return {
    friends,
    loading,
    addFriend,
    removeFriend,
    isFriend,
    getFriendItems,
    getAllFriendsItemsByCategory,
    refreshFriends: fetchFriends
  };
};