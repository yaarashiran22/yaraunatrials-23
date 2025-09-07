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
        flex-shrink-0 w-48 transition-all duration-500 ease-out hover:z-20
        ${isVisible ? 'animate-fade-in' : 'opacity-0 translate-y-8'}
        ${className}
      `}
      style={{ 
        animationDelay: `${index * 0.08}s`,
        transform: isVisible 
          ? 'scale(1) translateY(0px) rotateY(0deg)' 
          : 'scale(0.9) translateY(20px) rotateY(-5deg)',
        transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transformOrigin: 'center bottom'
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        if (isVisible) {
          e.currentTarget.style.transform = 'scale(1.05) translateY(-8px) rotateY(2deg)';
          e.currentTarget.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }
      }}
      onMouseLeave={(e) => {
        if (isVisible) {
          e.currentTarget.style.transform = 'scale(1) translateY(0px) rotateY(0deg)';
          e.currentTarget.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
      }}
    >
      {children}
    </div>
  );
};

export default ScrollAnimatedCard;