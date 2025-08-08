import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Camera, Users, MapPin, Trash2 } from 'lucide-react';
import { useDailyPhotoChallenge } from '@/hooks/useDailyPhotoChallenge';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

const DailyPhotoChallenge = () => {
  const { challenge, isLoading, submitPhoto, isSubmitting, deletePhoto, isDeleting, checkSubmissionQuery } = useDailyPhotoChallenge();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Check if user has already submitted today
  const { data: userSubmission } = checkSubmissionQuery(challenge?.id || '', user?.id);
  const hasUserSubmitted = !!userSubmission;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!selectedImage || !challenge) {
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
      imageUrl: selectedImage,
      isAnonymous,
      userId: user?.id,
    });

    setSelectedImage(null);
    setIsAnonymous(false);
  };

  if (isLoading) {
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

  if (!challenge) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>אין אתגר תמונה היום</p>
      </div>
    );
  }

  return (
    <div>
      {/* Photo Submissions in horizontal scroll layout like neighbor questions */}
      <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-4 xl:grid-cols-6 lg:gap-6 pb-2 scrollbar-hide">
        {/* Add Photo Card - Similar to UniformCard */}
        {!hasUserSubmitted && user && (
          <div className="flex-shrink-0 w-36 lg:w-auto">
            <div className="relative bg-transparent rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group w-full cursor-pointer">
              {selectedImage ? (
                <>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={selectedImage} 
                      alt="תמונה נבחרה" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 h-14 flex flex-col justify-between">
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
                      className="w-full h-7 text-xs"
                    >
                      {isSubmitting ? 'שולח...' : 'שלח'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="aspect-[4/3] border-2 border-dashed border-border rounded-t-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center px-2">
                      הוסף תמונה
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
                </>
              )}
            </div>
          </div>
        )}

        {!user && (
          <div className="flex-shrink-0 w-36 lg:w-auto">
            <div className="relative bg-transparent rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group w-full cursor-pointer">
              <div className="aspect-[4/3] border-2 border-dashed border-border rounded-t-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors">
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

        {/* Photo Submissions - Similar to UniformCard layout */}
        {challenge.submissions.map((submission) => (
          <div key={submission.id} className="flex-shrink-0 w-36 lg:w-auto">
            <div className="relative bg-card rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 group w-full cursor-pointer">
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
                
                {/* Text overlay with gradient background instead of white */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  {submission.is_anonymous ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">?</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">אנונימי</h4>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-white/70" />
                          <span className="text-xs text-white/70">שכונה</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"></div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">תושב</h4>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-white/70" />
                          <span className="text-xs text-white/70">פלורנטין</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {challenge.submissions.length === 0 && !hasUserSubmitted && !user && (
          <div className="flex-shrink-0 w-36 lg:w-auto text-center py-4 text-muted-foreground">
            <p className="text-xs">אין תמונות עדיין</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyPhotoChallenge;