import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import AIAssistantPopup from './AIAssistantPopup';

const AIAssistantButton: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsPopupOpen(true)}
        className="fixed bottom-20 lg:bottom-8 right-4 z-40 rounded-full w-14 h-14 shadow-lg bg-coral hover:bg-coral/90 text-coral-foreground"
        size="icon"
      >
        <Sparkles className="w-7 h-7" />
      </Button>
      
      <AIAssistantPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
};

export default AIAssistantButton;