import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  type: 'profiles' | 'cards' | 'header';
  count?: number;
}

const LoadingSkeleton = ({ type, count = 4 }: LoadingSkeletonProps) => {
  if (type === 'profiles') {
    return (
      <div className="flex gap-8 overflow-x-auto pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="w-16 h-4 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-40 space-y-3">
            <Skeleton className="w-40 h-28 rounded-xl" />
            <Skeleton className="w-32 h-4 rounded-full" />
            <Skeleton className="w-20 h-3 rounded-full opacity-60" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'header') {
    return (
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="w-32 h-8 rounded-lg" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;