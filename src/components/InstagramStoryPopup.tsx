import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Instagram, Sparkles, Share2 } from "lucide-react";
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
      <DialogContent className="max-w-lg mx-auto p-0 overflow-hidden border-0 bg-transparent shadow-none">
        {/* Glass morphism container with modern styling */}
        <div className="glass-effect rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-background/90 via-background/80 to-background/70 border border-white/20 shadow-2xl animate-scale-in">
          
          {/* Header with Instagram branding */}
          <DialogHeader className="relative p-6 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute -right-2 -top-2 h-10 w-10 rounded-full p-0 backdrop-blur-sm bg-black/10 hover:bg-red-500/20 hover:text-red-500 border border-white/10 transition-all duration-300 hover:scale-110 z-10"
            >
              <X className="h-5 w-5" />
            </Button>
            
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-3 pr-10">
              <div className="relative">
                <Instagram className="w-8 h-8 text-pink-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3">
                  <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
                </div>
              </div>
              Story Creator
            </DialogTitle>
            
            <p className="text-sm text-muted-foreground mt-2 font-medium leading-relaxed">
              Professional Instagram stories in seconds ✨
            </p>
          </DialogHeader>
          
          <div className="px-6 pb-6 space-y-6">
            {/* Loading State - Modern with shimmer */}
            {isGenerating && (
              <div className="space-y-8">
                {/* Modern loading animation */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 animate-pulse-glow flex items-center justify-center border border-pink-500/20">
                      <Instagram className="w-10 h-10 text-pink-500 animate-bounce-subtle" />
                    </div>
                    
                    {/* Spinning ring around the icon */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 animate-spin opacity-60" 
                         style={{ 
                           maskImage: 'linear-gradient(transparent 40%, black 40%, black 60%, transparent 60%)',
                           WebkitMaskImage: 'linear-gradient(transparent 40%, black 40%, black 60%, transparent 60%)'
                         }}>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-3 max-w-xs">
                    <h3 className="text-xl font-bold text-foreground tracking-tight">Creating Magic ✨</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      AI is crafting your perfect Instagram story...
                    </p>
                    
                    {/* Progress dots */}
                    <div className="flex justify-center space-x-2 mt-6">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full bg-pink-500 animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Larger preview placeholder with shimmer */}
                <div className="aspect-[9/16] w-full max-w-sm mx-auto rounded-3xl bg-gradient-to-br from-muted/30 to-muted/10 relative overflow-hidden border border-border/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer transform -skew-x-12"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                      <Instagram className="w-8 h-8 text-pink-500/60" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Completed State - Larger story preview */}
            {storyUrl && !isGenerating && (
              <div className="space-y-8 animate-slide-up">
                {/* Larger story preview with modern frame */}
                <div className="relative group mx-auto max-w-sm">
                  <div className="aspect-[9/16] rounded-3xl overflow-hidden relative border-2 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 p-[2px] shadow-2xl hover:shadow-pink-500/25 transition-all duration-500">
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-background relative">
                      <img 
                        src={storyUrl} 
                        alt="Generated Instagram Story" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {/* Close button overlay on image */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="absolute top-4 right-4 h-10 w-10 rounded-full p-0 backdrop-blur-md bg-black/30 hover:bg-black/50 text-white border border-white/20 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                      
                      {/* Instagram watermark */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 backdrop-blur-sm bg-black/30 rounded-full px-3 py-2 border border-white/20">
                        <Instagram className="w-4 h-4 text-white" />
                        <span className="text-sm text-white font-medium">Story</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 blur-2xl -z-10 opacity-75"></div>
                </div>
                
                {/* Enhanced success message with better typography */}
                <div className="text-center space-y-4 p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">Story Ready!</h3>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    Your professional Instagram story is ready to shine ✨
                  </p>
                </div>
                
                {/* Enhanced action buttons with better spacing */}
                <div className="flex gap-4">
                  <Button 
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 h-14 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105 border-0"
                  >
                    <Download className="w-6 h-6 mr-3" />
                    {downloading ? (
                      <span className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </span>
                    ) : (
                      "Download"
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleShare}
                    className="flex-1 h-14 border-2 border-accent/30 hover:border-accent/50 bg-background/50 backdrop-blur-sm hover:bg-accent/10 text-foreground font-bold text-base rounded-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Share2 className="w-6 h-6 mr-3" />
                    Share
                  </Button>
                </div>
              </div>
            )}
            
            {/* Enhanced close button */}
            {!isGenerating && (
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="w-full h-12 text-base text-muted-foreground hover:text-foreground rounded-2xl border border-border/50 hover:border-border transition-all duration-300 hover:bg-muted/30 font-medium"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};