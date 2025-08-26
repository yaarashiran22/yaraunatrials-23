import { memo } from "react";

interface FastLoadingSkeletonProps {
  type: 'profiles' | 'cards' | 'header';
  count?: number;
}

// Ultra-fast skeleton with minimal DOM elements
const FastLoadingSkeleton = memo(({ type, count = 4 }: FastLoadingSkeletonProps) => {
  if (type === 'profiles') {
    return (
      <div className="flex gap-6 overflow-x-auto pb-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-[66px] h-[66px] rounded-full bg-muted animate-pulse" />
            <div className="w-12 h-3 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex-shrink-0 w-32">
            <div className="w-32 h-20 rounded-lg mb-2 bg-muted animate-pulse" />
            <div className="w-24 h-3 rounded mb-1 bg-muted animate-pulse" />
            <div className="w-16 h-3 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'header') {
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="w-24 h-6 rounded bg-muted animate-pulse" />
        <div className="w-16 h-4 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  return null;
});

FastLoadingSkeleton.displayName = 'FastLoadingSkeleton';

export default FastLoadingSkeleton;