import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coffee, Zap, Heart, Dumbbell, Palette, Leaf, Music } from 'lucide-react';

const moodOptions = [
  { id: "chill", label: "Chill", icon: Coffee, color: "text-blue-500", activeBg: "bg-blue-50 dark:bg-blue-950/30" },
  { id: "go-out", label: "Go Out", icon: Zap, color: "text-orange-500", activeBg: "bg-orange-50 dark:bg-orange-950/30" },
  { id: "romantic", label: "Romantic", icon: Heart, color: "text-pink-500", activeBg: "bg-pink-50 dark:bg-pink-950/30" },
  { id: "active", label: "Active", icon: Dumbbell, color: "text-green-500", activeBg: "bg-green-50 dark:bg-green-950/30" },
  { id: "creative", label: "Creative", icon: Palette, color: "text-purple-500", activeBg: "bg-purple-50 dark:bg-purple-950/30" },
  { id: "wellness", label: "Wellness", icon: Leaf, color: "text-green-600", activeBg: "bg-green-50 dark:bg-green-950/30" },
  { id: "music", label: "Music", icon: Music, color: "text-cyan-500", activeBg: "bg-cyan-50 dark:bg-cyan-950/30" }
];

interface MoodSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodSelect: (mood: string) => void;
}

const MoodSelectionDialog = ({ isOpen, onClose, onMoodSelect }: MoodSelectionDialogProps) => {
  const [selectedMood, setSelectedMood] = useState<string>('chill');

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleConfirm = () => {
    onMoodSelect(selectedMood);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto bg-violet-500/20 border-violet-500/30">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-white">
            What's your mood?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-center text-white text-sm">
            Select your current mood to help others find the perfect hangout buddy
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {moodOptions.map((mood) => {
              const IconComponent = mood.icon;
              return (
                <Button
                  key={mood.id}
                  variant={selectedMood === mood.id ? "default" : "outline"}
                  className={`
                    h-16 flex flex-col items-center justify-center gap-2 transition-all duration-200
                    ${selectedMood === mood.id 
                      ? `${mood.activeBg} ${mood.color} border-current/20` 
                      : `hover:${mood.activeBg} ${mood.color}`
                    }
                  `}
                  onClick={() => handleMoodSelect(mood.id)}
                >
                  <IconComponent className={`h-5 w-5 ${mood.color}`} />
                  <span className="text-xs font-medium">{mood.label}</span>
                </Button>
              );
            })}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              Start Hanging Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoodSelectionDialog;