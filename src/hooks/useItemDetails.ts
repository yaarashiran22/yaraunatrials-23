import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ItemWithUploader {
  id: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  location?: string;
  status: string;
  created_at: string;
  uploader: {
    id: string;
    name: string;
    profile_image_url?: string;
    location?: string;
    small_profile_photo?: string;
  };
}

export const useItemDetails = (itemId: string) => {
  const [item, setItem] = useState<ItemWithUploader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItemDetails = async () => {
    if (!itemId) {
      setError('מזהה פריט לא תקין');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First fetch the item
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .eq('status', 'active')
        .single();

      if (itemError) throw itemError;
      
      if (!itemData) {
        setError('פריט לא נמצא');
        return;
      }

      // Then fetch the uploader profile
      const { data: uploaderData, error: uploaderError } = await supabase
        .from('profiles')
        .select('id, name, profile_image_url, location')
        .eq('id', itemData.user_id)
        .single();

      if (uploaderError) {
        console.error('Error fetching uploader profile:', uploaderError);
      }

      // Fetch small profile photo separately
      let smallProfilePhoto = null;
      if (uploaderData) {
        const { data: smallProfileData } = await supabase
          .from('smallprofiles')
          .select('photo')
          .eq('id', uploaderData.id)
          .single();
        
        smallProfilePhoto = smallProfileData?.photo;
      }

      const itemWithUploader: ItemWithUploader = {
        id: itemData.id,
        title: itemData.title,
        description: itemData.description,
        price: itemData.price,
        category: itemData.category,
        image_url: itemData.image_url,
        location: itemData.location,
        status: itemData.status,
        created_at: itemData.created_at,
        uploader: {
          id: uploaderData?.id || itemData.user_id,
          name: uploaderData?.name || 'משתמש',
          profile_image_url: uploaderData?.profile_image_url,
          location: uploaderData?.location,
          small_profile_photo: smallProfilePhoto
        }
      };

      setItem(itemWithUploader);
    } catch (error) {
      console.error('Error fetching item details:', error);
      setError('לא ניתן לטעון את פרטי הפריט');
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את פרטי הפריט",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [itemId]);

  return {
    item,
    loading,
    error,
    refetch: fetchItemDetails,
  };
};