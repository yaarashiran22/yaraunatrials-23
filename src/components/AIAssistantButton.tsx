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
        className="fixed bottom-32 lg:bottom-20 right-4 z-40 rounded-full w-14 h-14 shadow-lg bg-white hover:bg-gray-100 text-black border-4 border-purple-500 shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/60"
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