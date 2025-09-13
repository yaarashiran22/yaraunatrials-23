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
        className="fixed bottom-32 lg:bottom-20 right-4 z-40 rounded-full w-14 h-14 shadow-lg bg-white hover:bg-gray-50 text-black border border-tertiary-300 shadow-lg shadow-tertiary-300/30 hover:border-tertiary-400 hover:shadow-tertiary-400/40 transition-all duration-200"
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