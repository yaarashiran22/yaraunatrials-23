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
        className="fixed bottom-32 lg:bottom-20 right-4 z-40 rounded-full w-12 h-12 shadow-lg text-white hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: '#FF6F50'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#FF5A3D';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FF6F50';
        }}
        size="icon"
      >
        <Sparkles className="w-5 h-5" />
      </Button>
      
      <AIAssistantPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
};

export default AIAssistantButton;