import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Instagram, Sparkles, Share2, CheckCircle, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InstagramStoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  storyUrl: string | null;
  isGenerating: boolean;
  title: string;
  textContent?: string; // For text-based stories
  sourceType?: 'ai' | 'text'; // Type of story being generated
}

export const InstagramStoryPopup = ({ 
  isOpen, 
  onClose, 
  storyUrl, 
  isGenerating, 
  title,
  textContent,
  sourceType = 'ai'
}: InstagramStoryPopupProps) => {
  const [downloading, setDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success animation when story is ready
  useEffect(() => {
    if (storyUrl && !isGenerating && !showSuccess) {
      setShowSuccess(true);
      toast({
        title: "🎨 Story Created Successfully!",
        description: "Your viral-ready Instagram story is ready to download and share.",
      });
    }
  }, [storyUrl, isGenerating, showSuccess]);

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
              {sourceType === 'text' 
                ? "📝 Transform your story into viral Instagram content" 
                : "✨ AI-powered artistic stories in stunning HD quality"
              }
            </p>
          </DialogHeader>
          
          <div className="px-5 pb-5 space-y-5">
            {/* Enhanced Loading State with Modern Animations */}
            {isGenerating && (
              <div className="space-y-6 animate-fade-in">
                {/* Advanced loading animation with floating elements */}
                <div className="flex flex-col items-center space-y-5 relative">
                  <div className="relative">
                    {/* Main loading container with glassmorphism */}
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-orange-500/30 backdrop-blur-xl flex items-center justify-center border border-white/20 animate-pulse-glow shadow-2xl">
                      <Instagram className="w-10 h-10 text-pink-500 animate-bounce-subtle" />
                    </div>
                    
                    {/* Animated orbital rings */}
                    <div className="absolute inset-0 rounded-3xl">
                      <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 animate-spin opacity-60" 
                           style={{ 
                             maskImage: 'linear-gradient(transparent 40%, black 40%, black 60%, transparent 60%)',
                             WebkitMaskImage: 'linear-gradient(transparent 40%, black 40%, black 60%, transparent 60%)'
                           }}>
                      </div>
                    </div>
                    
                    {/* Floating sparkle effects */}
                    <div className="absolute -top-2 -right-2 animate-float-sparkle">
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    </div>
                    <div className="absolute -bottom-1 -left-1 animate-float-sparkle-delayed">
                      <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Enhanced text content with typewriter effect */}
                  <div className="text-center space-y-3 max-w-sm">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent animate-pulse tracking-tight">
                      {sourceType === 'text' ? '📝 Converting Story ✨' : '✨ AI Creating Magic ✨'}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {sourceType === 'text' ? (
                        <>
                          Transforming your story
                          <span className="text-pink-500 font-semibold"> "{textContent?.slice(0, 20)}..."</span> into a 
                          <span className="text-purple-500 font-semibold"> viral Instagram story</span> with
                          <span className="text-orange-500 font-semibold"> stunning visuals</span>...
                        </>
                      ) : (
                        <>
                          Crafting your ultra-viral Instagram story with 
                          <span className="text-pink-500 font-semibold"> holographic effects</span>,
                          <span className="text-purple-500 font-semibold"> 3D elements</span>, and
                          <span className="text-orange-500 font-semibold"> cinematic flair</span>...
                        </>
                      )}
                    </p>
                    
                    {/* Animated progress indicator */}
                    <div className="flex justify-center items-center space-x-2 mt-4">
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium ml-2">Generating...</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced preview placeholder with dynamic elements */}
                <div className="aspect-[9/16] w-full max-w-xs mx-auto rounded-3xl bg-gradient-to-br from-muted/40 via-muted/20 to-muted/10 relative overflow-hidden border-2 border-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 shadow-xl">
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer transform -skew-x-12"></div>
                  
                  {/* Floating design elements */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-pulse-glow">
                      <Instagram className="w-8 h-8 text-pink-500/80" />
                    </div>
                  </div>
                  
                  {/* Decorative floating elements */}
                  <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-pink-500/60 animate-float"></div>
                  <div className="absolute bottom-6 left-4 w-2 h-2 rounded-full bg-purple-500/60 animate-float-delayed"></div>
                  <div className="absolute top-1/3 left-6 w-2.5 h-2.5 rounded-full bg-orange-500/60 animate-float-sparkle"></div>
                </div>
              </div>
            )}
            
            {/* Enhanced Completed State with Success Animation */}
            {storyUrl && !isGenerating && (
              <div className="space-y-6 animate-slide-up">
                {/* Success celebration animation */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <CheckCircle className="w-4 h-4 text-green-500 animate-bounce" />
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">Story Ready!</span>
                  </div>
                </div>
                
                {/* Enhanced story preview with interactive elements */}
                <div className="relative group mx-auto max-w-xs hover:scale-[1.02] transition-all duration-500">
                  <div className="aspect-[9/16] rounded-3xl overflow-hidden relative border-2 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 p-[2px] shadow-2xl hover:shadow-pink-500/30 transition-all duration-500 animate-scale-in">
                    <div className="w-full h-full rounded-[20px] overflow-hidden bg-background relative">
                      <img 
                        src={storyUrl} 
                        alt="Generated Instagram Story" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Interactive overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                            <Download className="w-5 h-5 text-gray-700" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Instagram-style story indicators */}
                      <div className="absolute top-3 left-3 right-3 flex gap-1">
                        <div className="flex-1 h-0.5 bg-white/80 rounded-full"></div>
                      </div>
                      
                      {/* Enhanced Instagram branding */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 backdrop-blur-md bg-black/40 rounded-full px-3 py-1.5 border border-white/20">
                        <Instagram className="w-4 h-4 text-white" />
                        <span className="text-xs text-white font-semibold">Story</span>
                        <div className="w-1 h-1 rounded-full bg-white/60"></div>
                        <span className="text-xs text-white/80">HD</span>
                      </div>
                      
                      {/* Premium quality badge */}
                      <div className="absolute top-3 right-3 backdrop-blur-md bg-gradient-to-r from-pink-500/80 to-purple-500/80 rounded-full px-2 py-1 border border-white/20">
                        <span className="text-xs text-white font-bold">✨ AI</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced multi-layer glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 blur-xl -z-10 opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-orange-500/10 blur-2xl -z-20 opacity-50"></div>
                </div>
                
                {/* Enhanced success message with animation */}
                <div className="text-center space-y-3 p-5 rounded-2xl bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 border border-accent/20 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse"></div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
                      🎨 Masterpiece Created! 🚀
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Premium HD quality • Viral-ready design • Instagram optimized
                  </p>
                </div>
                
                {/* Enhanced action buttons with better animations */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105 border-0 relative overflow-hidden group"
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    
                    <Download className="w-4 h-4 mr-2 relative z-10" />
                    {downloading ? (
                      <span className="flex items-center gap-2 relative z-10">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </span>
                    ) : (
                      <span className="relative z-10">Download HD</span>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleShare}
                    className="flex-1 h-12 border-2 border-gradient-to-r from-pink-500/30 via-purple-500/30 to-orange-500/30 hover:border-gradient-to-r hover:from-pink-500/50 hover:via-purple-500/50 hover:to-orange-500/50 bg-background/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-pink-500/10 hover:via-purple-500/10 hover:to-orange-500/10 text-foreground font-bold text-sm rounded-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <Share2 className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10">Share</span>
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