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
        {/* Add Photo Card - Similar to NeighborQuestionCard */}
        {!hasUserSubmitted && user && (
          <Card className="flex-shrink-0 w-32 lg:w-auto bg-background border border-dashed border-border rounded-lg p-3 min-h-[160px]">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src={profile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                  alt={profile?.name || "אתה"}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-foreground text-xs">
                    {profile?.name || "אתה"}
                  </h4>
                </div>
              </div>
              
              {selectedImage ? (
                <div className="space-y-2 flex-1">
                  <div className="w-full h-20 rounded-lg overflow-hidden border">
                    <img 
                      src={selectedImage} 
                      alt="תמונה נבחרה" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex items-center gap-1">
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
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Plus className="h-5 w-5 text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground text-center">
                        הוסף תמונה
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {!user && (
          <Card className="flex-shrink-0 w-32 lg:w-auto bg-background border border-dashed border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center justify-center min-h-[160px] text-center">
            <Plus className="h-5 w-5 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">
              התחבר כדי להעלות
            </p>
          </Card>
        )}

        {hasUserSubmitted && (
          <Card className="flex-shrink-0 w-32 lg:w-auto bg-green-50 border-green-200 p-3 min-h-[160px] flex flex-col items-center justify-center text-center">
            <Camera className="h-5 w-5 text-green-600 mb-1" />
            <p className="text-green-700 text-xs font-medium">
              ✓ שלחת היום
            </p>
          </Card>
        )}

        {/* Photo Submissions - Similar to NeighborQuestionItem layout */}
        {challenge.submissions.map((submission) => (
          <Card key={submission.id} className="flex-shrink-0 w-32 lg:w-auto bg-white border border-border rounded-lg p-2 min-h-[160px]">
            <div className="flex flex-col h-full">
              {/* Photo */}
              <div className="w-full h-20 rounded-lg overflow-hidden border mb-2">
                <img 
                  src={submission.image_url} 
                  alt="תמונת משתמש" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
              
              {/* User info at bottom */}
              <div className="flex items-center gap-2 mt-auto">
                {submission.is_anonymous ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-xs">אנונימי</h4>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-2 w-2 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">שכונה</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"></div>
                    <div>
                      <h4 className="font-medium text-foreground text-xs">תושב</h4>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-2 w-2 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">פלורנטין</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
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