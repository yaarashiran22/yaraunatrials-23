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
        className="fixed bottom-32 lg:bottom-20 right-4 z-40 rounded-full w-14 h-14 shadow-lg bg-white hover:bg-gray-50 text-black border-2 border-tertiary-400 shadow-lg shadow-tertiary-400/40 hover:border-tertiary-500 hover:shadow-tertiary-500/50 transition-all duration-200"
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