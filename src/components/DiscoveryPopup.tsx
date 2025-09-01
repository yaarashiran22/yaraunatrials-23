import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DiscoveryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscover: (selectedInterests: string[]) => void;
}

const DiscoveryPopup = ({ isOpen, onClose, onDiscover }: DiscoveryPopupProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(id => id !== interest)
        : [...prev, interest]
    );
  };

  const handleDiscover = () => {
    onDiscover(selectedInterests);
    onClose();
  };

  const handleClose = () => {
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
              disabled={selectedInterests.length === 0}
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