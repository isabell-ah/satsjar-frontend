import React, { Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton Components for better loading experience
export const ChildDashboardSkeleton = () => (
  <div className="space-y-6 animate-fade-in p-4 lg:p-6 xl:p-8">
    {/* Header Skeleton */}
    <Card className="overflow-hidden border-0 shadow-glass">
      <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 bg-white/30" />
            <Skeleton className="h-4 w-24 bg-white/20" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full bg-white/30" />
        </div>
        
        {/* Jar Skeleton */}
        <div className="mt-6 flex flex-col items-center justify-center">
          <div className="relative">
            <Skeleton className="w-32 h-40 rounded-lg bg-white/40" />
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <Skeleton className="h-4 w-16 bg-white/30" />
            </div>
          </div>
        </div>
      </div>
    </Card>

    {/* Action Buttons Skeleton */}
    <div className="grid grid-cols-2 gap-4 lg:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>

    {/* Chart Skeleton */}
    <Card className="shadow-glass">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full" />
      </CardContent>
    </Card>
  </div>
);

export const ChildCardSkeleton = () => (
  <Card className="shadow-glass">
    <CardContent className="p-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    </CardContent>
  </Card>
);

export const GoalsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="shadow-glass">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
            <div className="flex justify-between text-sm">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Loading wrapper with age-appropriate styling
interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  childAge?: number;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  children,
  skeleton,
  childAge,
}) => {
  if (isLoading) {
    const ageClass = childAge && childAge <= 12 ? 'child-young' : 'child-teen';
    
    return (
      <div className={`${ageClass} child-loading`}>
        {skeleton || <ChildDashboardSkeleton />}
      </div>
    );
  }

  return <>{children}</>;
};

// Lazy loading wrapper for components
export const LazyWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  childAge?: number;
}> = ({ children, fallback, childAge }) => {
  const defaultFallback = (
    <LoadingWrapper 
      isLoading={true} 
      children={null} 
      childAge={childAge}
    />
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [loadingTimes, setLoadingTimes] = React.useState<Record<string, number>>({});

  const startTimer = (key: string) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setLoadingTimes(prev => ({ ...prev, [key]: duration }));
      
      // Log slow operations (> 1 second)
      if (duration > 1000) {
        console.warn(`Slow operation detected: ${key} took ${duration.toFixed(2)}ms`);
      }
    };
  };

  return { loadingTimes, startTimer };
};

// Optimized image loading component
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  childAge?: number;
}> = ({ src, alt, className, childAge }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const ageClass = childAge && childAge <= 12 ? 'child-young' : 'child-teen';

  if (hasError) {
    return (
      <div className={`${className} ${ageClass} flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded`}>
        <span className="text-gray-500">🖼️</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <Skeleton className={`absolute inset-0 ${ageClass}`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};

// Cache management utilities
export const cacheManager = {
  set: (key: string, data: any, ttl: number = 5 * 60 * 1000) => {
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
  },

  get: (key: string) => {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();

      if (now - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return parsed.data;
    } catch {
      return null;
    }
  },

  clear: (pattern?: string) => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_') && (!pattern || key.includes(pattern))) {
        localStorage.removeItem(key);
      }
    });
  },
};
