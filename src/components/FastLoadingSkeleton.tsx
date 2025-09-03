import { memo } from "react";

interface FastLoadingSkeletonProps {
  type: 'profiles' | 'cards' | 'header';
  count?: number;
}

// Ultra-fast skeleton with shimmer effects and better spacing
const FastLoadingSkeleton = memo(({ type, count = 4 }: FastLoadingSkeletonProps) => {
  if (type === 'profiles') {
    return (
      <div className="flex gap-8 overflow-x-auto pb-4 px-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-muted to-muted/70 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            <div className="w-16 h-4 rounded-full bg-muted animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4 px-2">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex-shrink-0 w-36">
            <div className="w-36 h-24 rounded-xl mb-3 bg-gradient-to-br from-muted to-muted/70 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            <div className="w-28 h-4 rounded-full mb-2 bg-muted animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            <div className="w-20 h-3 rounded-full bg-muted animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'header') {
    return (
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="w-32 h-7 rounded-lg bg-muted animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
        <div className="w-20 h-5 rounded-lg bg-muted animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    );
  }

  return null;
});

FastLoadingSkeleton.displayName = 'FastLoadingSkeleton';

export default FastLoadingSkeleton;