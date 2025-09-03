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
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden border-0 bg-transparent shadow-none">
        {/* Glass morphism container with modern styling - smaller size */}
        <div className="glass-effect rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-background/90 via-background/80 to-background/70 border border-white/20 shadow-2xl animate-scale-in">
          
          {/* Header with Instagram branding */}
          <DialogHeader className="relative p-5 pb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute -right-2 -top-2 h-8 w-8 rounded-full p-0 backdrop-blur-sm bg-black/10 hover:bg-red-500/20 hover:text-red-500 border border-white/10 transition-all duration-300 hover:scale-110 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-2 pr-8">
              <div className="relative">
                <Instagram className="w-6 h-6 text-pink-500" />
                <div className="absolute -top-1 -right-1 w-2 h-2">
                  <Sparkles className="w-2 h-2 text-yellow-400 animate-pulse" />
                </div>
              </div>
              Story Creator
            </DialogTitle>
            
            <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
              ✨ AI-powered artistic stories in stunning HD quality
            </p>
          </DialogHeader>
          
          <div className="px-5 pb-5 space-y-5">
            {/* Loading State - Modern with shimmer */}
            {isGenerating && (
              <div className="space-y-5">
                {/* Modern loading animation */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 animate-pulse-glow flex items-center justify-center border border-pink-500/20">
                      <Instagram className="w-7 h-7 text-pink-500 animate-bounce-subtle" />
                    </div>
                    
                    {/* Spinning ring around the icon */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 animate-spin opacity-60" 
                         style={{ 
                           maskImage: 'linear-gradient(transparent 40%, black 40%, black 60%, transparent 60%)',
                           WebkitMaskImage: 'linear-gradient(transparent 40%, black 40%, black 60%, transparent 60%)'
                         }}>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2 max-w-xs">
                    <h3 className="text-lg font-bold text-foreground tracking-tight">Creating Artistic Magic ✨</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      AI is crafting your ultra-modern, cinematic Instagram story with holographic effects and 3D elements...
                    </p>
                    
                    {/* Progress dots */}
                    <div className="flex justify-center space-x-1 mt-4">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Smaller preview placeholder with shimmer */}
                <div className="aspect-[9/16] w-full max-w-xs mx-auto rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 relative overflow-hidden border border-border/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer transform -skew-x-12"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-pink-500/60" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Completed State - Smaller story preview */}
            {storyUrl && !isGenerating && (
              <div className="space-y-5 animate-slide-up">
                {/* Smaller story preview with modern frame */}
                <div className="relative group mx-auto max-w-xs">
                  <div className="aspect-[9/16] rounded-2xl overflow-hidden relative border-2 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 p-[2px] shadow-xl hover:shadow-pink-500/20 transition-all duration-500">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-background relative">
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
                        className="absolute top-2 right-2 h-7 w-7 rounded-full p-0 backdrop-blur-md bg-black/30 hover:bg-black/50 text-white border border-white/20 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      
                      {/* Instagram watermark */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 backdrop-blur-sm bg-black/30 rounded-full px-2 py-1 border border-white/20">
                        <Instagram className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-medium">Story</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-orange-500/15 blur-xl -z-10 opacity-75"></div>
                </div>
                
                {/* Compact success message */}
                <div className="text-center space-y-2 p-4 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">Artistic Story Ready! 🎨</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Premium HD quality with cinematic effects
                  </p>
                </div>
                
                {/* Compact action buttons */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 h-11 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-pink-500/20 transition-all duration-300 hover:scale-105 border-0"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {downloading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </span>
                    ) : (
                      "Download"
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleShare}
                    className="flex-1 h-11 border-2 border-accent/30 hover:border-accent/50 bg-background/50 backdrop-blur-sm hover:bg-accent/10 text-foreground font-semibold text-sm rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            )}
            
            {/* Compact close button */}
            {!isGenerating && (
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="w-full h-10 text-sm text-muted-foreground hover:text-foreground rounded-xl border border-border/50 hover:border-border transition-all duration-300 hover:bg-muted/30 font-medium"
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