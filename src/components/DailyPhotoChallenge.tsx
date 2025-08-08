import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Camera, Users, MapPin, Trash2 } from 'lucide-react';
import { useDailyPhotoChallenge } from '@/hooks/useDailyPhotoChallenge';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

const DailyPhotoChallenge = () => {
  const { 
    challenge, 
    isLoading, 
    submitPhoto, 
    isSubmitting, 
    deletePhoto, 
    isDeleting, 
    checkSubmissionQuery,
    pictureGalleries,
    galleriesLoading,
    addPictureToGallery,
    isAddingPicture,
    deletePictureFromGallery,
    isDeletingPicture
  } = useDailyPhotoChallenge();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // For permanent gallery uploads
  const [gallerySelectedImage, setGallerySelectedImage] = useState<string | null>(null);
  const [gallerySelectedFile, setGallerySelectedFile] = useState<File | null>(null);

  // Check if user has already submitted today
  const { data: userSubmission } = checkSubmissionQuery(challenge?.id || '', user?.id);
  const hasUserSubmitted = !!userSubmission;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setGallerySelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setGallerySelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile || !challenge) {
      toast({
        title: "שגיאה",
        description: "נא לבחור תמונה לשליחה",
        variant: "destructive",
      });
      return;
    }

    if (hasUserSubmitted) {
      toast({
        title: "כבר שלחת תמונה היום",
        description: "ניתן לשלוח רק תמונה אחת ליום",
        variant: "destructive",
      });
      return;
    }

    submitPhoto({
      challengeId: challenge.id,
      imageFile: selectedFile,
      isAnonymous,
      userId: user?.id,
    });

    setSelectedImage(null);
    setSelectedFile(null);
    setIsAnonymous(false);
  };

  const handleGallerySubmit = () => {
    if (!gallerySelectedFile) {
      toast({
        title: "שגיאה",
        description: "נא לבחור תמונה להוספה",
        variant: "destructive",
      });
      return;
    }

    addPictureToGallery({
      imageFile: gallerySelectedFile,
      userId: user?.id,
    });

    setGallerySelectedImage(null);
    setGallerySelectedFile(null);
  };

  if (isLoading || galleriesLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-muted rounded-lg mb-4"></div>
        <div className="flex gap-3 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-64 h-80 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Photo Submissions and Permanent Gallery in horizontal scroll layout */}
      <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-4 xl:grid-cols-6 lg:gap-6 pb-2 scrollbar-hide">
        
        {/* Add Photo Card for Gallery - Always visible */}
        {user && (
          <div className="flex-shrink-0 w-36 lg:w-auto">
            <div className="relative bg-transparent rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group w-full cursor-pointer">
              {gallerySelectedImage ? (
                <>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={gallerySelectedImage} 
                      alt="תמונה נבחרה לגלריה" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 h-14 flex items-center gap-2 bg-transparent">
                    <Button 
                      onClick={handleGallerySubmit}
                      disabled={isAddingPicture}
                      size="sm"
                      className="w-full h-7 text-xs"
                    >
                      {isAddingPicture ? 'מוסיף...' : 'הוסף לגלריה'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="aspect-[4/3] border-2 border-dashed border-primary/30 rounded-t-xl flex flex-col items-center justify-center hover:border-primary/60 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center px-2">
                      הוסף תמונה
                    </p>
                  </div>
                  <div className="p-3 h-14 flex items-center gap-2 bg-transparent">
                    <img 
                      src={profile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                      alt={profile?.name || "אתה"}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <h4 className="font-semibold text-foreground text-sm">
                      {profile?.name || "אתה"}
                    </h4>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Daily Challenge Add Photo Card - Only when challenge exists and user hasn't submitted */}
        {challenge && !hasUserSubmitted && user && (
          <div className="flex-shrink-0 w-36 lg:w-auto">
            <div className="relative bg-transparent rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group w-full cursor-pointer border-2 border-dashed border-yellow-400/50">
              {selectedImage ? (
                <>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={selectedImage} 
                      alt="תמונה נבחרה לאתגר יומי" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 h-14 flex flex-col justify-between bg-transparent">
                    <div className="flex items-center gap-1 mb-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded w-3 h-3"
                      />
                      <label htmlFor="anonymous" className="text-xs text-muted-foreground">
                        אנונימי
                      </label>
                    </div>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      size="sm"
                      className="w-full h-7 text-xs bg-yellow-500 hover:bg-yellow-600"
                    >
                      {isSubmitting ? 'שולח...' : 'שלח לאתגר'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="aspect-[4/3] border-2 border-dashed border-yellow-400/50 rounded-t-xl flex flex-col items-center justify-center hover:border-yellow-400 transition-colors bg-yellow-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Camera className="h-8 w-8 text-yellow-600 mb-2" />
                    <p className="text-sm text-yellow-700 text-center px-2 font-medium">
                      אתגר היום
                    </p>
                  </div>
                  <div className="p-3 h-14 flex items-center gap-2 bg-transparent">
                    <img 
                      src={profile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                      alt={profile?.name || "אתה"}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <h4 className="font-semibold text-foreground text-sm">
                      {profile?.name || "אתה"}
                    </h4>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {!user && (
          <div className="flex-shrink-0 w-36 lg:w-auto">
            <div className="relative bg-transparent rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group w-full cursor-pointer">
              <div className="aspect-[4/3] border-2 border-dashed border-primary/30 rounded-t-xl flex flex-col items-center justify-center hover:border-primary/60 transition-colors">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center px-2">
                  התחבר כדי להעלות
                </p>
              </div>
              <div className="p-3 h-14 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">משתמש אורח</p>
              </div>
            </div>
          </div>
        )}

        {hasUserSubmitted && (
          <div className="flex-shrink-0 w-36 lg:w-auto">
            <div className="relative bg-card rounded-xl overflow-hidden shadow-card border-2 border-green-200 w-full">
              <div className="aspect-[4/3] bg-green-50 flex flex-col items-center justify-center">
                <Camera className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-green-700 text-sm font-medium text-center px-2">
                  ✓ שלחת היום
                </p>
              </div>
              <div className="p-3 h-14 flex items-center gap-2">
                <img 
                  src={profile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                  alt={profile?.name || "אתה"}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <h4 className="font-semibold text-foreground text-sm">
                  {profile?.name || "אתה"}
                </h4>
              </div>
            </div>
          </div>
        )}

        {/* Permanent Picture Gallery */}
        {pictureGalleries?.map((picture) => (
          <div key={`gallery-${picture.id}`} className="flex-shrink-0 w-36 lg:w-auto">
            <div className="relative bg-transparent rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group w-full cursor-pointer">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={picture.image_url} 
                  alt="תמונה מהגלריה" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Delete button for user's own gallery pictures */}
                {picture.user_id === user?.id && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePictureFromGallery(picture.id);
                    }}
                    disabled={isDeletingPicture}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {/* User info below the image */}
              <div className="p-3 h-14 flex items-center gap-2 bg-transparent">
                <img 
                  src={picture.user_profile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                  alt={picture.user_profile?.name || "משתמש"}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{picture.user_profile?.name || "משתמש"}</h4>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">פלורנטין</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Daily Challenge Submissions */}
        {challenge?.submissions.map((submission) => (
          <div key={submission.id} className="flex-shrink-0 w-36 lg:w-auto">
            <div className="relative bg-transparent rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group w-full cursor-pointer">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={submission.image_url} 
                  alt="תמונת משתמש" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Delete button for user's own photos */}
                {submission.user_id === user?.id && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(submission.id);
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {/* User info below the image */}
              <div className="p-3 h-14 flex items-center gap-2 bg-transparent">
                {submission.is_anonymous ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">אנונימי</h4>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">שכונה</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img 
                      src={submission.user_profile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                      alt={submission.user_profile?.name || "משתמש"}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{submission.user_profile?.name || "משתמש"}</h4>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">פלורנטין</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {((!challenge?.submissions?.length && !pictureGalleries?.length) || !user) && (
          <div className="flex-shrink-0 w-36 lg:w-auto text-center py-4 text-muted-foreground">
            <p className="text-xs">אין תמונות עדיין</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyPhotoChallenge;