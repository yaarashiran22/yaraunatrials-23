import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Users, MapPin, Clock, X, Camera, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface FriendMeetupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const FriendMeetupPopup = ({ isOpen, onClose }: FriendMeetupPopupProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [friendsOnly, setFriendsOnly] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const isVideo = file.type.startsWith('video/');
      setFileType(isVideo ? 'video' : 'image');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !place.trim() || !time.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "שגיאה", 
        description: "עליך להיות מחובר כדי ליצור מפגש",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      let imageUrl = '';
      let videoUrl = '';
      
      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const bucketName = fileType === 'video' ? 'videos' : 'photos';

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (fileType === 'video') {
          videoUrl = urlData.publicUrl;
        } else {
          imageUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: `🎉 מפגש חברים!\n\n📍 איפה: ${place}\n⏰ מתי: ${time}\n\n${description}`,
          friends_only: friendsOnly,
          location: place,
          image_url: imageUrl || null,
          video_url: videoUrl || null
        });

      if (error) throw error;

      toast({
        title: "מפגש נוצר בהצלחה!",
        description: friendsOnly ? "החברים שלך יכולים לראות את המפגש בפיד" : "כולם יכולים לראות את המפגש בפיד",
      });

      // Reset form
      setTitle('');
      setPlace('');
      setTime('');
      setDescription('');
      setFriendsOnly(true);
      setSelectedFile(null);
      setFilePreview(null);
      setFileType(null);
      onClose();
    } catch (error) {
      console.error('Error creating meetup:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצר את המפגש כרגע",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setPlace('');
    setTime('');
    setDescription('');
    setFriendsOnly(true);
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-background border-0 p-0 overflow-hidden">
        <div className="relative">
          {/* Large Hero Image */}
          <div className="relative h-64 w-full overflow-hidden">
            {filePreview ? (
              <>
                {fileType === 'video' ? (
                  <video
                    src={filePreview}
                    className="w-full h-full object-cover"
                    controls
                    muted
                  />
                ) : (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeFile}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full p-0 shadow-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Add photo or video</p>
                </div>
              </div>
            )}
            
            {/* Close Button */}
            <Button 
              type="button"
              variant="ghost" 
              onClick={handleClose}
              className="absolute top-3 left-3 h-8 w-8 rounded-full p-0 bg-black/20 hover:bg-black/30 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">Create Spontaneous Meetup</h2>
              <p className="text-sm text-muted-foreground">Organize a quick hangout with friends</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's the plan?"
                className="h-12 text-base"
                required
              />

              <Input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Where to meet?"
                className="h-12 text-base"
                required
              />

              <Input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="When? (e.g., Today at 7 PM)"
                className="h-12 text-base"
                required
              />

              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any additional details..."
                className="min-h-16 text-base resize-none"
              />

              {/* Media Upload Button */}
              {!filePreview && (
                <>
                  <input
                    id="media-upload"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Label htmlFor="media-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 h-12 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/60 transition-colors">
                      <Camera className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Add Photo or Video</span>
                    </div>
                  </Label>
                </>
              )}

              {/* Friends Only Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Friends Only</span>
                </div>
                <Switch
                  checked={friendsOnly}
                  onCheckedChange={setFriendsOnly}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isCreating || !title.trim() || !place.trim() || !time.trim()}
                  className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Meetup'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FriendMeetupPopup;