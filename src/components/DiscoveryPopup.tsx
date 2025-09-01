import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, Users } from 'lucide-react';

interface DiscoveryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscover: (selectedInterests: string[], connectionType: string) => void;
}

const connectionTypes = [
  { id: "friendships", label: "Friendships", icon: Users, color: "text-blue-500" },
  { id: "dating", label: "Dating", icon: Heart, color: "text-pink-500" }
];

const DiscoveryPopup = ({ isOpen, onClose, onDiscover }: DiscoveryPopupProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [connectionType, setConnectionType] = useState<string>('friendships');

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(id => id !== interest)
        : [...prev, interest]
    );
  };

  const handleDiscover = () => {
    onDiscover(selectedInterests, connectionType);
    onClose();
  };

  const handleClose = () => {
    setSelectedInterests([]);
    setConnectionType('friendships');
    onClose();
  };

  // Common interests/specialties
  const commonInterests = [
    "Wellness", "Art", "Music", "Food", "Travel", "Fitness", 
    "Photography", "Movies", "Gaming", "Cooking", "Dancing", "Sports",
    "Social Media", "Writing", "Raves"
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
          {/* Connection Type Selection */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Type of Connection</h3>
            <div className="grid grid-cols-1 gap-2">
              {connectionTypes.map((connection) => {
                const IconComponent = connection.icon;
                const isSelected = connectionType === connection.id;
                
                return (
                  <Button
                    key={connection.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`flex items-center gap-2 justify-start px-3 py-2 h-auto ${
                      isSelected 
                        ? `${connection.color} bg-primary/10 border-primary/20` 
                        : `${connection.color} hover:bg-muted/50`
                    }`}
                    onClick={() => setConnectionType(connection.id)}
                  >
                    <IconComponent className={`h-4 w-4 ${connection.color}`} />
                    <span className="text-sm font-medium">{connection.label}</span>
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