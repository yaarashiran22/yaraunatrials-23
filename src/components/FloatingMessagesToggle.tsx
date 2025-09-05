import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FloatingMessagesToggle = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-28 right-4 z-40 flex flex-col gap-3">
      {/* Messages Button */}
      <Button
        onClick={() => navigate('/messages')}
        size="icon-lg"
        variant="mint"
        className="rounded-full shadow-floating transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 backdrop-blur-sm social-glow"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>
    </div>
  );
};

export default FloatingMessagesToggle;