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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-800">
            <Users className="h-5 w-5" />
            מפגש חברים ספונטני
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              כותרת המפגש *
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="למה נפגשים?"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="place" className="text-sm font-medium flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              מקום *
            </Label>
            <Input
              id="place"
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="איפה נפגשים?"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="time" className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" />
              זמן *
            </Label>
            <Input
              id="time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="מתי? (למשל: היום ב-19:00)"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              פרטים נוספים
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="מה עוד חשוב לדעת?"
              className="mt-1 h-20"
            />
          </div>

          {/* Media Upload */}
          <div>
            <Label htmlFor="media" className="text-sm font-medium flex items-center gap-1">
              <Camera className="h-4 w-4" />
              תמונה או וידאו
            </Label>
            <div className="mt-1">
              {filePreview ? (
                <div className="relative">
                  {fileType === 'video' ? (
                    <video
                      src={filePreview}
                      className="w-full h-40 object-cover rounded-lg"
                      controls
                      muted
                    />
                  ) : (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeFile}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <input
                    id="media-upload"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Label htmlFor="media-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 transition-colors">
                      <Image className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">לחץ להוספת תמונה או וידאו</span>
                    </div>
                  </Label>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="friendsOnly" className="text-sm font-medium">
              רק לחברים
            </Label>
            <Switch
              id="friendsOnly"
              checked={friendsOnly}
              onCheckedChange={setFriendsOnly}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800 text-sm">
              <Users className="h-4 w-4" />
              <span className="font-medium">
                {friendsOnly ? "רק החברים שלך יראו את המפגש הזה" : "כולם יוכלו לראות את המפגש הזה"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isCreating || !title.trim() || !place.trim() || !time.trim()}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isCreating ? 'יוצר מפגש...' : 'צור מפגש'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FriendMeetupPopup;