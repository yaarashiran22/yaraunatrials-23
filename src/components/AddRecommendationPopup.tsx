import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLocations } from '@/hooks/useUserLocations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddRecommendationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onRecommendationAdded?: () => void;
}

const AddRecommendationPopup = ({ isOpen, onClose, onRecommendationAdded }: AddRecommendationPopupProps) => {
  const { user } = useAuth();
  const { userLocations } = useUserLocations();
  
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user's location
  const userLocation = userLocations.find(loc => loc.user_id === user?.id);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to add recommendations');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!userLocation) {
      toast.error('Please share your location first to add recommendations at your current location');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
        if (!imageUrl) {
          toast.error('Failed to upload image');
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare location data using user's current location
      const locationData = JSON.stringify({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        address: userLocation.address || `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`
      });

      // Insert recommendation into items table
      const { error } = await supabase
        .from('items')
        .insert({
          title: title.trim(),
          description: title.trim(), // Using title as description for buzz
          image_url: imageUrl,
          location: locationData,
          user_id: user.id,
          category: 'recommendation',
          status: 'active',
          market: 'argentina', // Since it's Buenos Aires
          instagram_url: null
        });

      if (error) {
        console.error('Error creating recommendation:', error);
        toast.error('Failed to create recommendation');
        return;
      }

      toast.success('Buzz added at your current location!');
      
      // Reset form
      setTitle('');
      setSelectedFile(null);
      
      onRecommendationAdded?.();
      onClose();
    } catch (error) {
      console.error('Error creating recommendation:', error);
      toast.error('An error occurred while creating the recommendation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setTitle('');
    setSelectedFile(null);
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle>Add Buzz</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Location Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            {userLocation ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Using your current location</p>
                  <p className="text-xs text-muted-foreground">
                    {userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Location not shared</p>
                  <p className="text-xs text-muted-foreground">
                    Please share your location first to add buzz
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Text *</Label>
              <Input
                id="title"
                placeholder="What's buzzing?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="photo">Photo</Label>
              <div className="mt-1">
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('photo')?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {selectedFile ? selectedFile.name : 'Upload Photo'}
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !userLocation}
              className="flex-1"
            >
              {isSubmitting ? 'Adding...' : 'Add Buzz'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecommendationPopup;