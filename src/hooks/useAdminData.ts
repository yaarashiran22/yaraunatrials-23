import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAdminData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all tables data
  const fetchTableData = async (tableName: string, limit = 50) => {
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  };

  // Delete record mutation
  const deleteRecord = useMutation({
    mutationFn: async ({ tableName, id }: { tableName: string; id: string }) => {
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { tableName }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-table', tableName] });
      toast({
        title: "Success",
        description: "Record deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete record: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Get table data hook
  const useTableData = (tableName: string) => {
    return useQuery({
      queryKey: ['admin-table', tableName],
      queryFn: () => fetchTableData(tableName),
      refetchInterval: 30000, // Refresh every 30 seconds
    });
  };

  return {
    useTableData,
    deleteRecord: deleteRecord.mutate,
    isDeleting: deleteRecord.isPending
  };
}