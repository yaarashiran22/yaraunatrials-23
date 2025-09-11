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
      <DialogContent className="max-w-md bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/10 backdrop-blur-sm">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="flex items-center justify-center gap-3 text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            <div className="p-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            מפגש חברים ספונטני
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-foreground flex items-center gap-1">
              כותרת המפגש <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="למה נפגשים?"
              className="h-12 bg-card/50 border-2 border-border hover:border-primary/30 focus:border-primary transition-all duration-200 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="place" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              מקום <span className="text-destructive">*</span>
            </Label>
            <Input
              id="place"
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="איפה נפגשים?"
              className="h-12 bg-card/50 border-2 border-border hover:border-primary/30 focus:border-primary transition-all duration-200 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              זמן <span className="text-destructive">*</span>
            </Label>
            <Input
              id="time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="מתי? (למשל: היום ב-19:00)"
              className="h-12 bg-card/50 border-2 border-border hover:border-primary/30 focus:border-primary transition-all duration-200 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground">
              פרטים נוספים
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="מה עוד חשוב לדעת?"
              className="min-h-20 bg-card/50 border-2 border-border hover:border-primary/30 focus:border-primary transition-all duration-200 text-base resize-none"
            />
          </div>

          {/* Enhanced Media Upload */}
          <div className="space-y-2">
            <Label htmlFor="media" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              תמונה או וידאו
            </Label>
            <div className="relative">
              {filePreview ? (
                <div className="relative group">
                  <div className="border-4 border-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl overflow-hidden">
                    {fileType === 'video' ? (
                      <video
                        src={filePreview}
                        className="w-full h-48 object-cover"
                        controls
                        muted
                      />
                    ) : (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeFile}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full p-0 shadow-lg opacity-90 hover:opacity-100 transition-opacity"
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
                    <div className="group flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-primary/30 rounded-2xl hover:border-primary/60 transition-all duration-300 bg-gradient-to-br from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10">
                      <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200 mb-3">
                        <Image className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        לחץ להוספת תמונה או וידאו
                      </span>
                      <span className="text-xs text-muted-foreground/70 mt-1">
                        PNG, JPG, MP4 עד 10MB
                      </span>
                    </div>
                  </Label>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-card/50 to-muted/20 rounded-xl border border-border/50">
            <Label htmlFor="friendsOnly" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              רק לחברים
            </Label>
            <Switch
              id="friendsOnly"
              checked={friendsOnly}
              onCheckedChange={setFriendsOnly}
            />
          </div>

          <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
            friendsOnly 
              ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30' 
              : 'bg-gradient-to-r from-accent/10 to-muted/20 border-accent/30'
          }`}>
            <div className="flex items-center gap-3 text-sm">
              <div className={`p-2 rounded-full ${friendsOnly ? 'bg-primary/20' : 'bg-accent/20'}`}>
                <Users className={`h-4 w-4 ${friendsOnly ? 'text-primary' : 'text-accent-foreground'}`} />
              </div>
              <span className="font-medium text-foreground">
                {friendsOnly ? "רק החברים שלך יראו את המפגש הזה" : "כולם יוכלו לראות את המפגש הזה"}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isCreating || !title.trim() || !place.trim() || !time.trim()}
              className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground"></div>
                  יוצר מפגש...
                </div>
              ) : (
                'צור מפגש'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-12 w-12 p-0 border-2 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FriendMeetupPopup;