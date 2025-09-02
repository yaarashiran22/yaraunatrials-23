import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Instagram } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InstagramStoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  storyUrl: string | null;
  isGenerating: boolean;
  title: string;
}

export const InstagramStoryPopup = ({ 
  isOpen, 
  onClose, 
  storyUrl, 
  isGenerating, 
  title 
}: InstagramStoryPopupProps) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!storyUrl) return;
    
    setDownloading(true);
    try {
      const response = await fetch(storyUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `instagram-story-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete!",
        description: "Your Instagram story has been saved to your device.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (!storyUrl) return;
    
    if (navigator.share) {
      navigator.share({
        title: `Instagram Story: ${title}`,
        text: 'Check out this Instagram story!',
        url: storyUrl,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(storyUrl).then(() => {
        toast({
          title: "Link Copied!",
          description: "Story link copied to clipboard.",
        });
      }).catch(() => {
        toast({
          title: "Share Failed",
          description: "Unable to share. Please try downloading instead.",
          variant: "destructive",
        });
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm mx-auto bg-background border border-border/50 shadow-xl">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-0 top-0 h-6 w-6 rounded-full p-0 hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2 pr-8">
            <Instagram className="w-6 h-6 text-pink-500" />
            Instagram Story Ready!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {isGenerating && (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-muted-foreground text-center">
                Creating your Instagram story...
              </p>
            </div>
          )}
          
          {storyUrl && !isGenerating && (
            <>
              <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden relative">
                <img 
                  src={storyUrl} 
                  alt="Generated Instagram Story" 
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground text-center">
                Your Instagram story is ready! Download it to share on your Instagram.
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? "Downloading..." : "Download"}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </>
          )}
          
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};