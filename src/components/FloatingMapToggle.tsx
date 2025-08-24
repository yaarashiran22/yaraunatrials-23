import React from 'react';
import { Map, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingMapToggleProps {
  isMapOpen: boolean;
  onToggle: () => void;
}

const FloatingMapToggle = ({ isMapOpen, onToggle }: FloatingMapToggleProps) => {
  return (
    <div className="fixed bottom-20 lg:bottom-8 right-4 z-40">
      <Button
        onClick={onToggle}
        size="lg"
        className={`
          w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-in-out
          ${isMapOpen 
            ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
            : 'text-white hover:scale-105 active:scale-95'
          }
        `}
        style={!isMapOpen ? {
          backgroundColor: '#FF6F50'
        } : undefined}
        onMouseEnter={(e) => {
          if (!isMapOpen) {
            e.currentTarget.style.backgroundColor = '#FF5A3D';
          }
        }}
        onMouseLeave={(e) => {
          if (!isMapOpen) {
            e.currentTarget.style.backgroundColor = '#FF6F50';
          }
        }}
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