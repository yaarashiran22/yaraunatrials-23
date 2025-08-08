import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Camera, Users, MapPin } from 'lucide-react';
import { useDailyPhotoChallenge } from '@/hooks/useDailyPhotoChallenge';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

const DailyPhotoChallenge = () => {
  const { challenge, isLoading, submitPhoto, isSubmitting, checkSubmissionQuery } = useDailyPhotoChallenge();
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
          <div className="flex-shrink-0 w-32 lg:w-auto">
            <div className="relative bg-card rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 group w-full cursor-pointer">
              {selectedImage ? (
                <>
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={selectedImage} 
                      alt="תמונה נבחרה" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 h-12 flex flex-col justify-between">
                    <div className="flex items-center gap-1 mb-1">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded w-2.5 h-2.5"
                      />
                      <label htmlFor="anonymous" className="text-xs text-muted-foreground/70">
                        אנונימי
                      </label>
                    </div>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      size="sm"
                      className="w-full h-6 text-xs"
                    >
                      {isSubmitting ? 'שולח...' : 'שלח'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="aspect-square border-2 border-dashed border-border rounded-t-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Plus className="h-6 w-6 text-muted-foreground/70 mb-1" />
                    <p className="text-xs text-muted-foreground/70 text-center px-2">
                      הוסף תמונה
                    </p>
                  </div>
                  <div className="p-2 h-12 flex items-center gap-2">
                    <img 
                      src={profile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                      alt={profile?.name || "אתה"}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <h4 className="font-medium text-foreground/80 text-xs">
                      {profile?.name || "אתה"}
                    </h4>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {!user && (
          <div className="flex-shrink-0 w-32 lg:w-auto">
            <div className="relative bg-card rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 group w-full cursor-pointer">
              <div className="aspect-square border-2 border-dashed border-border rounded-t-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors">
                <Plus className="h-6 w-6 text-muted-foreground/70 mb-1" />
                <p className="text-xs text-muted-foreground/70 text-center px-2">
                  התחבר כדי להעלות
                </p>
              </div>
              <div className="p-2 h-12 flex items-center justify-center">
                <p className="text-xs text-muted-foreground/70">משתמש אורח</p>
              </div>
            </div>
          </div>
        )}

        {hasUserSubmitted && (
          <div className="flex-shrink-0 w-32 lg:w-auto">
            <div className="relative bg-card rounded-xl overflow-hidden shadow-card border-2 border-green-200 w-full">
              <div className="aspect-square bg-green-50 flex flex-col items-center justify-center">
                <Camera className="h-6 w-6 text-green-600 mb-1" />
                <p className="text-green-700 text-xs font-medium text-center px-2">
                  ✓ שלחת היום
                </p>
              </div>
              <div className="p-2 h-12 flex items-center gap-2">
                <img 
                  src={profile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                  alt={profile?.name || "אתה"}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <h4 className="font-medium text-foreground/80 text-xs">
                  {profile?.name || "אתה"}
                </h4>
              </div>
            </div>
          </div>
        )}

        {/* Photo Submissions - Similar to UniformCard layout */}
        {challenge.submissions.map((submission) => (
          <div key={submission.id} className="flex-shrink-0 w-32 lg:w-auto">
            <div className="relative bg-card rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 group w-full cursor-pointer">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={submission.image_url} 
                  alt="תמונת משתמש" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-2 h-12 flex items-center gap-1.5">
                {submission.is_anonymous ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground/80 text-xs">אנונימי</h4>
                      <div className="flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5 text-muted-foreground/70" />
                        <span className="text-xs text-muted-foreground/70">שכונה</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"></div>
                    <div>
                      <h4 className="font-medium text-foreground/80 text-xs">תושב</h4>
                      <div className="flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5 text-muted-foreground/70" />
                        <span className="text-xs text-muted-foreground/70">פלורנטין</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {challenge.submissions.length === 0 && !hasUserSubmitted && !user && (
          <div className="flex-shrink-0 w-32 lg:w-auto text-center py-4 text-muted-foreground">
            <p className="text-xs">אין תמונות עדיין</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyPhotoChallenge;