import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeedImage {
  id: string;
  image_url?: string;
  content?: string;
  created_at: string;
}

interface FeedImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: FeedImage[];
  initialImageId?: string;
}

export const FeedImageViewer = ({ isOpen, onClose, images, initialImageId }: FeedImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialImageId) {
      const index = images.findIndex(img => img.id === initialImageId);
      return index !== -1 ? index : 0;
    }
    return 0;
  });

  const currentImage = images[currentIndex];

  if (!currentImage?.image_url) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black/95">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Image */}
        <div className="flex items-center justify-center h-full w-full">
          <img
            src={currentImage.image_url}
            alt="תמונה מהפיד"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Image Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="text-white">
            {currentImage.content && (
              <p className="text-sm mb-2 opacity-90">{currentImage.content}</p>
            )}
            <p className="text-xs opacity-70">{formatDate(currentImage.created_at)}</p>
            {images.length > 1 && (
              <p className="text-xs opacity-70 mt-1">
                {currentIndex + 1} מתוך {images.length}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};