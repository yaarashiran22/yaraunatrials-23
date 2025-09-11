import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AIAssistantPopup from './AIAssistantPopup';

const GeminiSparkles = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="w-7 h-7">
    <path d="M12 2L14 8L12 14L10 8Z" fill="#4285F4" />
    <path d="M22 12L16 14L10 12L16 10Z" fill="#EA4335" />
    <path d="M12 22L10 16L12 10L14 16Z" fill="#FBBC04" />
    <path d="M2 12L8 10L14 12L8 14Z" fill="#34A853" />
  </svg>
);

const AIAssistantButton: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsPopupOpen(true)}
        className="fixed bottom-32 lg:bottom-20 right-4 z-40 rounded-full w-14 h-14 shadow-lg bg-red-500 hover:bg-red-600 text-white"
        size="icon"
      >
        <GeminiSparkles />
      </Button>
      
      <AIAssistantPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
};

export default AIAssistantButton;