import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminDataTable } from '@/components/AdminDataTable';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminUsersPage() {
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

  const userColumns = [
    'id', 'email', 'name', 'username', 'bio', 'location', 
    'market', 'account_type', 'is_private', 'open_to_connecting', 'created_at'
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="ml-4" />
            <h1 className="ml-4 text-lg font-semibold">User Management</h1>
          </header>
          
          <main className="flex-1 p-6 space-y-6">
            <AdminDataTable
              tableName="profiles"
              title="User Profiles"
              columns={userColumns}
            />
            
            <AdminDataTable
              tableName="user_roles"
              title="User Roles"
              columns={['id', 'user_id', 'role', 'created_at']}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}