import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAdminAuth() {
  const { user } = useAuth();
  
  // Debug logging
  console.log('🔐 useAdminAuth - user:', user);
  console.log('🔐 useAdminAuth - user id:', user?.id);
  
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-auth', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('🔐 No user found, returning false');
        return false;
      }
      
      console.log('🔐 Checking admin status for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('🔐 Error checking admin status:', error);
        return false;
      }
      
      console.log('🔐 Admin check result:', data);
      return !!data;
    },
    enabled: !!user,
  });
  
  console.log('🔐 useAdminAuth returning - isAdmin:', isAdmin, 'isLoading:', isLoading, 'user:', !!user);
  
  return {
    isAdmin: isAdmin || false,
    isLoading,
    user
  };
}