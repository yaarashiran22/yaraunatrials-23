import React from 'react';
import { Map, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingMapToggleProps {
  isMapOpen: boolean;
  onToggle: () => void;
}

const FloatingMapToggle = ({ isMapOpen, onToggle }: FloatingMapToggleProps) => {
  return (
    <div className="fixed bottom-44 lg:bottom-8 right-4 z-40">
      <Button
        onClick={onToggle}
        size="icon-lg"
        variant={isMapOpen ? "destructive" : "jacaranda"}
        className="rounded-full shadow-floating transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 backdrop-blur-sm"
      >
        {isMapOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Map className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};

export default FloatingMapToggle;