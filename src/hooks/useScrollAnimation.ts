import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (threshold = 0.6) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger animation when element comes into view
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: threshold,
        rootMargin: '0px'
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold]);

  return { elementRef, isVisible };
};