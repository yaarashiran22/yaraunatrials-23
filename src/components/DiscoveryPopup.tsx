import React, { useState } from 'react';
import { X, Users, Coffee, Zap, Heart, Dumbbell, Palette, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const moodFilters = [
  { id: "chill", label: "Chill", icon: Coffee, color: "text-blue-500" },
  { id: "go-out", label: "Go Out", icon: Zap, color: "text-orange-500" },
  { id: "romantic", label: "Romantic", icon: Heart, color: "text-pink-500" },
  { id: "active", label: "Active", icon: Dumbbell, color: "text-green-500" },
  { id: "creative", label: "Creative", icon: Palette, color: "text-purple-500" },
  { id: "social", label: "Social", icon: Users, color: "text-indigo-500" },
  { id: "sightseeing", label: "Sightseeing", icon: Camera, color: "text-cyan-500" }
];

interface DiscoveryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscover: (selectedMoods: string[], selectedInterests: string[]) => void;
}

const DiscoveryPopup = ({ isOpen, onClose, onDiscover }: DiscoveryPopupProps) => {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleMoodToggle = (moodId: string) => {
    setSelectedMoods(prev => 
      prev.includes(moodId) 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(id => id !== interest)
        : [...prev, interest]
    );
  };

  const handleDiscover = () => {
    onDiscover(selectedMoods, selectedInterests);
    onClose();
  };

  const handleClose = () => {
    setSelectedMoods([]);
    setSelectedInterests([]);
    onClose();
  };

  // Common interests/specialties
  const commonInterests = [
    "Coffee", "Art", "Music", "Food", "Travel", "Fitness", "Technology", 
    "Photography", "Reading", "Movies", "Gaming", "Cooking", "Dancing", "Sports"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Discover Who's Around You
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mood Selection */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Select Your Mood</h3>
            <div className="grid grid-cols-2 gap-2">
              {moodFilters.map((mood) => {
                const IconComponent = mood.icon;
                const isSelected = selectedMoods.includes(mood.id);
                
                return (
                  <Button
                    key={mood.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`flex items-center gap-2 justify-start px-3 py-2 h-auto ${
                      isSelected 
                        ? `${mood.color} bg-primary/10 border-primary/20` 
                        : `${mood.color} hover:bg-muted/50`
                    }`}
                    onClick={() => handleMoodToggle(mood.id)}
                  >
                    <IconComponent className={`h-4 w-4 ${mood.color}`} />
                    <span className="text-sm font-medium">{mood.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Interest Selection */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Select Your Interests</h3>
            <div className="grid grid-cols-3 gap-2">
              {commonInterests.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                
                return (
                  <Button
                    key={interest}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`text-xs px-2 py-1 h-auto ${
                      isSelected 
                        ? 'bg-primary/10 border-primary/20 text-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDiscover}
              className="flex-1"
              disabled={selectedMoods.length === 0 && selectedInterests.length === 0}
            >
              Discover
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscoveryPopup;