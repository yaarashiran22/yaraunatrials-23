import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Camera, Users } from 'lucide-react';
import { useDailyPhotoChallenge } from '@/hooks/useDailyPhotoChallenge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const DailyPhotoChallenge = () => {
  const { challenge, isLoading, submitPhoto, isSubmitting, checkSubmissionQuery } = useDailyPhotoChallenge();
  const { user } = useAuth();
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
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
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

      {/* Upload Section */}
      {!hasUserSubmitted && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Button 
                variant="outline" 
                className="w-full h-12 border-dashed border-2 hover:bg-muted/50"
              >
                <Plus className="h-4 w-4 ml-2" />
                בחר תמונה לשליחה
              </Button>
            </div>

            {selectedImage && (
              <div className="space-y-3">
                <div className="w-full h-32 rounded-lg overflow-hidden border">
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
                  <label htmlFor="anonymous" className="text-sm text-muted-foreground">
                    שלח באופן אנונימי
                  </label>
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'שולח...' : 'שלח תמונה'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {hasUserSubmitted && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-green-700 text-center">
            ✓ שלחת תמונה היום! תוכל לשלוח שוב מחר
          </p>
        </Card>
      )}

      {/* Submissions Grid */}
      {challenge.submissions.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {challenge.submissions.slice(0, 9).map((submission) => (
            <div key={submission.id} className="aspect-square rounded-lg overflow-hidden border">
              <img 
                src={submission.image_url} 
                alt="תמונת משתמש" 
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
          ))}
        </div>
      )}

      {challenge.submissions.length > 9 && (
        <div className="text-center">
          <Button variant="ghost" size="sm">
            הצג עוד תמונות ({challenge.submissions.length - 9})
          </Button>
        </div>
      )}
    </div>
  );
};

export default DailyPhotoChallenge;