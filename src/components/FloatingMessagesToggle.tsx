import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FloatingMessagesToggle = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-[8.5rem] lg:bottom-20 right-4 z-40">
      <Button
        onClick={() => navigate('/messages')}
        size="default"
        className="w-12 h-12 rounded-full shadow-lg transition-all duration-300 ease-in-out text-white hover:scale-105 active:scale-95"
        style={{
          backgroundColor: '#60A5FA'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2563EB';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#60A5FA';
        }}
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default FloatingMessagesToggle;