import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Upload, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface AddRecommendationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onRecommendationAdded?: () => void;
}

const AddRecommendationPopup = ({ isOpen, onClose, onRecommendationAdded }: AddRecommendationPopupProps) => {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !mapContainer.current) return;

    const initializeMap = () => {
      // Buenos Aires coordinates - center of the city
      const buenosAiresCenter: [number, number] = [-34.6118, -58.3960];

      // Create map with Leaflet
      const map = L.map(mapContainer.current!, {
        zoomControl: true,
        attributionControl: true,
        fadeAnimation: true,
        zoomAnimation: true,
      }).setView(buenosAiresCenter, 13);
      
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 10,
      }).addTo(map);

      // Add click handler to place marker
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }
        
        // Create new marker
        const marker = L.marker([lat, lng]).addTo(map);
        markerRef.current = marker;
        
        // Update selected location
        setSelectedLocation({ lat, lng });
        
        toast.success('Location selected!');
      });
    };

    // Initialize map with small delay
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

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

    if (!selectedLocation) {
      toast.error('Please select a location on the map');
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

      // Prepare location data
      const locationData = JSON.stringify({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
      });

      // Insert recommendation into items table
      const { error } = await supabase
        .from('items')
        .insert({
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl,
          location: locationData,
          user_id: user.id,
          category: 'recommendation',
          status: 'active',
          market: 'argentina', // Since it's Buenos Aires
          mobile_number: instagramUrl.trim() // Using mobile_number field for Instagram URL temporarily
        });

      if (error) {
        console.error('Error creating recommendation:', error);
        toast.error('Failed to create recommendation');
        return;
      }

      toast.success('Recommendation added successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setInstagramUrl('');
      setSelectedFile(null);
      setSelectedLocation(null);
      
      // Remove marker
      if (markerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      
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
    setDescription('');
    setInstagramUrl('');
    setSelectedFile(null);
    setSelectedLocation(null);
    
    // Remove marker
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Recommendation</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Select Location</Label>
              <p className="text-xs text-muted-foreground mb-2">Click on the map to pin the location</p>
            </div>
            <div className="relative bg-card rounded-lg overflow-hidden border h-64">
              <div ref={mapContainer} className="w-full h-full" />
              {selectedLocation && (
                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </div>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Café Tortoni"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about this place..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                placeholder="https://instagram.com/cafetortoni"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
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

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !selectedLocation}
                className="flex-1"
              >
                {isSubmitting ? 'Adding...' : 'Add Recommendation'}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecommendationPopup;