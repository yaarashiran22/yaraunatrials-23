import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, RefreshCw } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface AdminDataTableProps {
  tableName: string;
  title: string;
  columns: string[];
  onRefresh?: () => void;
}

export function AdminDataTable({ tableName, title, columns, onRefresh }: AdminDataTableProps) {
  const { useTableData, deleteRecord, isDeleting } = useAdminData();
  const { data, isLoading, refetch } = useTableData(tableName);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);

  const handleDeleteClick = (record: any) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      deleteRecord({ tableName, id: recordToDelete.id });
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  const formatCellValue = (value: any, key: string) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    if (key.includes('url') && typeof value === 'string' && value.startsWith('http')) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline max-w-32 block truncate"
        >
          View
        </a>
      );
    }
    if (typeof value === 'string' && value.length > 50) {
      return (
        <span className="max-w-48 block truncate" title={value}>
          {value}
        </span>
      );
    }
    return String(value);
  };

  if (isLoading) {
    return <LoadingSkeleton type="cards" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No records found in {tableName} table
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column} className="min-w-32">
                      {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </TableHead>
                  ))}
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((record: any) => (
                  <TableRow key={record.id}>
                    {columns.map((column) => (
                      <TableCell key={column} className="max-w-48">
                        {formatCellValue(record[column], column)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(record)}
                        disabled={isDeleting}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}