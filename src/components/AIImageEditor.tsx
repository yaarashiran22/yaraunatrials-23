import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Wand2, Download, X, Loader2, Scissors } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

interface AIImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage?: string;
  onImageEdited?: (editedImageUrl: string) => void;
}

export const AIImageEditor = ({ 
  isOpen, 
  onClose, 
  initialImage,
  onImageEdited 
}: AIImageEditorProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage || null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setEditedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      // Convert data URL to blob then to image
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const imageElement = await loadImage(blob);
      
      // Remove background
      const resultBlob = await removeBackground(imageElement);
      
      // Convert blob back to data URL
      const resultDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(resultBlob);
      });
      
      setEditedImage(resultDataUrl);
      
      toast({
        title: "Background Removed!",
        description: "Background has been successfully removed from your image.",
      });
    } catch (error) {
      console.error('Background removal error:', error);
      toast({
        title: "Background Removal Failed",
        description: "Failed to remove background. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const imageToDownload = editedImage || selectedImage;
    if (!imageToDownload) return;

    const link = document.createElement('a');
    link.href = imageToDownload;
    link.download = `edited-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Complete!",
      description: "Your edited image has been saved to your device.",
    });
  };

  const handleSaveEdit = () => {
    const finalImage = editedImage || selectedImage;
    if (finalImage && onImageEdited) {
      onImageEdited(finalImage);
      toast({
        title: "Image Saved!",
        description: "Your edited image has been applied.",
      });
      onClose();
    }
  };

  const displayImage = editedImage || selectedImage;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Image Editor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Upload/Display Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Image</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload New
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {displayImage ? (
              <div className="relative group">
                <img
                  src={displayImage}
                  alt="Selected image"
                  className="w-full max-h-96 object-contain rounded-lg border"
                />
                {editedImage && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Edited
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-2">
                  Upload an image to start editing
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select Image
                </Button>
              </div>
            )}
          </div>

          {/* AI Editing Tools */}
          {selectedImage && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">AI Tools</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Background Removal */}
                <div className="space-y-2">
                  <Button
                    onClick={handleRemoveBackground}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-2"
                    variant="outline"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Scissors className="w-4 h-4" />
                    )}
                    {isProcessing ? "Removing Background..." : "Remove Background"}
                  </Button>
                </div>

                {/* Future: Add more AI editing tools here */}
                <div className="space-y-2">
                  <Button
                    disabled
                    className="w-full flex items-center gap-2"
                    variant="outline"
                  >
                    <Wand2 className="w-4 h-4" />
                    More Tools Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Text Prompt for Future AI Edits */}
          {selectedImage && (
            <div className="space-y-2">
              <Label htmlFor="edit-prompt" className="text-base font-semibold">
                AI Edit Prompt (Coming Soon)
              </Label>
              <Textarea
                id="edit-prompt"
                placeholder="Describe how you want to edit the image... (e.g., 'make it darker and more industrial', 'add snow', 'change to sunset lighting')"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                className="min-h-[80px]"
                disabled
              />
              <p className="text-sm text-muted-foreground">
                Advanced AI editing with text prompts will be available soon. Currently only background removal is available.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {displayImage && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              
              {onImageEdited && (
                <Button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Apply Changes
                </Button>
              )}
              
              <Button
                onClick={onClose}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};