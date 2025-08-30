import React, { useState } from 'react';
import { MessageCircle, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AIAssistantPopup from './AIAssistantPopup';

const FloatingMessagesToggle = () => {
  const navigate = useNavigate();
  const [isAIPopupOpen, setIsAIPopupOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-20 lg:bottom-8 right-4 z-40 flex flex-col gap-3">
        {/* AI Assistant Button */}
        <Button
          onClick={() => setIsAIPopupOpen(true)}
          size="default"
          className="w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-in-out text-white hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
        >
          <Bot className="h-6 w-6" />
        </Button>
        
        {/* Messages Button */}
        <Button
          onClick={() => navigate('/messages')}
          size="default"
          className="w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-in-out text-white hover:scale-105 active:scale-95"
          style={{
            backgroundColor: '#FF6B42'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FF5722';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FF6B42';
          }}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
      
      <AIAssistantPopup
        isOpen={isAIPopupOpen}
        onClose={() => setIsAIPopupOpen(false)}
      />
    </>
  );
};

export default FloatingMessagesToggle;