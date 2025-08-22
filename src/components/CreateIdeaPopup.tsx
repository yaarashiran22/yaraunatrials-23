import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateIdeaPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onIdeaCreated: (question: string, imageUrl: string, neighborhood: string) => Promise<boolean>;
}

const CreateIdeaPopup = ({ isOpen, onClose, onIdeaCreated }: CreateIdeaPopupProps) => {
  const [question, setQuestion] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "שגיאה",
        description: "נא לבחור קובץ תמונה",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "שגיאה",
        description: "גודל הקובץ גדול מדי (מקסימום 5MB)",
        variant: "destructive"
      });
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Unexpected error uploading image:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין שאלה",
        variant: "destructive"
      });
      return;
    }

    if (!neighborhood.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין שכונה",
        variant: "destructive"
      });
      return;
    }

    if (!selectedImage) {
      toast({
        title: "שגיאה",
        description: "נא להוסיף תמונה",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreating(true);

      // Upload image
      const imageUrl = await uploadImage(selectedImage);
      if (!imageUrl) {
        toast({
          title: "שגיאה",
          description: "לא ניתן להעלות את התמונה",
          variant: "destructive"
        });
        return;
      }

      // Create idea
      const success = await onIdeaCreated(question, imageUrl, neighborhood);
      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error('Error creating idea:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בלתי צפויה",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setQuestion('');
    setNeighborhood('');
    setSelectedImage(null);
    setImagePreview(null);
    onClose();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>פרסם רעיון לשכונה</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question Input */}
          <div className="space-y-2">
            <Label htmlFor="question">שאלה לשכונה</Label>
            <Textarea
              id="question"
              placeholder="למשל: האם אתם בעד הקמת פארק חדש ברחוב הראשי?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[80px]"
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground">
              {question.length}/500 תווים
            </p>
          </div>

          {/* Neighborhood Input */}
          <div className="space-y-2">
            <Label htmlFor="neighborhood">שכונה</Label>
            <Input
              id="neighborhood"
              placeholder="למשל: פלורנטין, נווה צדק..."
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>תמונה</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="תמונה נבחרה"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-3">הוסף תמונה לרעיון</p>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      בחר תמונה
                    </span>
                  </Button>
                </Label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={!question.trim() || !neighborhood.trim() || !selectedImage || creating || uploading}
              className="flex-1"
            >
              {creating || uploading ? "מפרסם..." : "פרסם רעיון"}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={creating || uploading}>
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIdeaPopup;