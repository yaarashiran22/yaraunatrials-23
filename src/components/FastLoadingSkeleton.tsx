import { memo } from "react";

interface FastLoadingSkeletonProps {
  type: 'profiles' | 'cards' | 'header';
  count?: number;
}

// Ultra-fast skeleton with minimal DOM elements and better contrast
const FastLoadingSkeleton = memo(({ type, count = 4 }: FastLoadingSkeletonProps) => {
  if (type === 'profiles') {
    return (
      <div className="flex gap-8 overflow-x-auto pb-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-muted/70 animate-pulse" />
            <div className="w-16 h-4 rounded-full bg-muted/50 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex-shrink-0 w-40 space-y-3">
            <div className="w-40 h-28 rounded-xl bg-muted/70 animate-pulse" />
            <div className="w-32 h-4 rounded-full bg-muted/60 animate-pulse" />
            <div className="w-20 h-3 rounded-full bg-muted/40 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'header') {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="w-32 h-8 rounded-lg bg-muted/70 animate-pulse" />
        <div className="w-20 h-6 rounded-full bg-muted/50 animate-pulse" />
      </div>
    );
  }

  return null;
});

FastLoadingSkeleton.displayName = 'FastLoadingSkeleton';

export default FastLoadingSkeleton;