import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminDataTable } from '@/components/AdminDataTable';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function AdminCommunitiesPage() {
  const { isAdmin, isLoading, user } = useAdminAuth();

  if (isLoading) {
    return <LoadingSkeleton type="cards" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="ml-4" />
            <h1 className="ml-4 text-lg font-semibold">Community Management</h1>
          </header>
          
          <main className="flex-1 p-6 space-y-6">
            <AdminDataTable
              tableName="communities"
              title="Communities"
              columns={['id', 'creator_id', 'name', 'category', 'access_type', 'member_count', 'is_active', 'market', 'created_at']}
            />
            
            <AdminDataTable
              tableName="community_members"
              title="Community Members"
              columns={['id', 'community_id', 'user_id', 'role', 'status', 'joined_at']}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}