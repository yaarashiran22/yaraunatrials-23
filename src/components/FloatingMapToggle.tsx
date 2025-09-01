import React from 'react';
import { Map, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingMapToggleProps {
  isMapOpen: boolean;
  onToggle: () => void;
}

const FloatingMapToggle = ({ isMapOpen, onToggle }: FloatingMapToggleProps) => {
  return (
    <div className="fixed bottom-48 lg:bottom-36 right-4 z-40">
      <Button
        onClick={onToggle}
        size="default"
        className={`
          w-12 h-12 rounded-full shadow-lg transition-all duration-300 ease-in-out
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
          <X className="h-5 w-5" />
        ) : (
          <Map className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default FloatingMapToggle;