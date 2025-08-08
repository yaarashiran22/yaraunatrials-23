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
    <div className="space-y-4">
      {/* Today's Challenge Instruction */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <Camera className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-primary">תמונת היום</h3>
        </div>
        <p className="text-lg font-medium text-foreground mb-2">
          {challenge.instruction_text}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{challenge.submissions.length} תמונות נשלחו</span>
        </div>
      </Card>

      {/* Photo Submissions in horizontal scroll layout like neighbor questions */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Add Photo Card - Similar to NeighborQuestionCard */}
        {!hasUserSubmitted && user && (
          <Card className="flex-shrink-0 w-64 bg-background border border-dashed border-border rounded-lg p-4 min-h-[300px]">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={profile?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
                  alt={profile?.name || "אתה"}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-foreground text-sm">
                    {profile?.name || "אתה"}
                  </h4>
                  <p className="text-xs text-muted-foreground">עכשיו</p>
                </div>
              </div>
              
              {selectedImage ? (
                <div className="space-y-3 flex-1">
                  <div className="w-full h-40 rounded-lg overflow-hidden border">
                    <img 
                      src={selectedImage} 
                      alt="תמונה נבחרה" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="anonymous" className="text-xs text-muted-foreground">
                      שלח באופן אנונימי
                    </label>
                  </div>

                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="sm"
                    className="w-full"
                  >
                    {isSubmitting ? 'שולח...' : 'שלח תמונה'}
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
                    <div className="h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        הוסף תמונה לאתגר
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {!user && (
          <Card className="flex-shrink-0 w-64 bg-background border border-dashed border-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center justify-center min-h-[300px] text-center">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              התחבר כדי להעלות תמונה
            </p>
          </Card>
        )}

        {hasUserSubmitted && (
          <Card className="flex-shrink-0 w-64 bg-green-50 border-green-200 p-4 min-h-[300px] flex flex-col items-center justify-center text-center">
            <Camera className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-green-700 text-sm font-medium mb-1">
              ✓ שלחת תמונה היום!
            </p>
            <p className="text-green-600 text-xs">
              תוכל לשלוח שוב מחר
            </p>
          </Card>
        )}

        {/* Photo Submissions - Similar to NeighborQuestionItem layout */}
        {challenge.submissions.map((submission) => (
          <Card key={submission.id} className="flex-shrink-0 w-64 bg-white border border-border rounded-lg p-4 min-h-[300px]">
            <div className="flex flex-col h-full">
              {/* Photo */}
              <div className="w-full h-40 rounded-lg overflow-hidden border mb-3">
                <img 
                  src={submission.image_url} 
                  alt="תמונת משתמש" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
              
              {/* User info at bottom */}
              <div className="flex items-center gap-3 mt-auto">
                {submission.is_anonymous ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">אנונימי</h4>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">שכונה</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"></div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">תושב שכונה</h4>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">פלורנטין</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}

        {challenge.submissions.length === 0 && (
          <div className="flex-shrink-0 w-64 text-center py-8 text-muted-foreground">
            <p className="text-sm">אין תמונות עדיין</p>
            <p className="text-xs mt-1">היה הראשון לשתף!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyPhotoChallenge;