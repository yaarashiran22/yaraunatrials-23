import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { resizeAndCopyProfilePictures } from '@/utils/resizeProfilePictures';
import { useToast } from '@/hooks/use-toast';

export const ResizeProfilePicturesButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleResize = async () => {
    setIsProcessing(true);
    try {
      const result = await resizeAndCopyProfilePictures();
      console.log('Resize result:', result);
      
      const successCount = result.results?.filter(r => r.status === 'success').length || 0;
      const errorCount = result.results?.filter(r => r.status === 'error').length || 0;
      
      toast({
        title: 'Profile Pictures Processed',
        description: `Successfully processed ${successCount} images. ${errorCount} errors.`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process profile pictures',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handleResize} 
      disabled={isProcessing}
      className="mb-4"
    >
      {isProcessing ? 'Processing...' : 'Resize All Profile Pictures'}
    </Button>
  );
};