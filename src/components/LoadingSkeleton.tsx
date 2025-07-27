import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  type: 'profiles' | 'cards' | 'header';
  count?: number;
}

const LoadingSkeleton = ({ type, count = 4 }: LoadingSkeletonProps) => {
  if (type === 'profiles') {
    return (
      <div className="flex gap-6 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-12 h-3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-32">
            <Skeleton className="w-32 h-20 rounded-lg mb-2" />
            <Skeleton className="w-24 h-3 rounded mb-1" />
            <Skeleton className="w-16 h-3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'header') {
    return (
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-24 h-6 rounded" />
        <Skeleton className="w-16 h-4 rounded" />
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;