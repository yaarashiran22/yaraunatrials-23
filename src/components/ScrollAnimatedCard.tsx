import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollAnimatedCardProps {
  children: React.ReactNode;
  index: number;
  className?: string;
}

const ScrollAnimatedCard: React.FC<ScrollAnimatedCardProps> = ({ 
  children, 
  index, 
  className = "" 
}) => {
  const { elementRef, isVisible } = useScrollAnimation(0.5);

  return (
    <div
      ref={elementRef}
      className={`
        flex-shrink-0 w-48 animate-fade-in hover-scale transition-all duration-300 ease-out
        ${isVisible ? 'scale-105 shadow-lg' : 'scale-100'}
        ${className}
      `}
      style={{ 
        animationDelay: `${index * 0.1}s`,
        transform: isVisible ? 'scale(1.05) translateY(-4px)' : 'scale(1) translateY(0px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

export default ScrollAnimatedCard;