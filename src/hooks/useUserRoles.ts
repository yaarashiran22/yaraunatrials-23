import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useUserRoles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all user roles
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          profiles (name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'moderator' | 'user' }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: "Success",
        description: "Role added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add role: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: "Success",
        description: "Role removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove role: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    userRoles,
    isLoading,
    addRole: addRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    isAddingRole: addRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
  };
}