-- Clean up unused storage bucket
DELETE FROM storage.buckets WHERE id = 'daily-photos';