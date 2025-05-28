import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: 'default' | 'amber' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showGlow?: boolean;
  showPercentage?: boolean;
  showMarkers?: boolean;
  label?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value,
      variant = 'amber',
      size = 'md',
      animated = false,
      showGlow = false,
      showPercentage = false,
      showMarkers = false,
      label,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-4',
      lg: 'h-6',
    };

    const variantClasses = {
      default: {
        root: 'bg-secondary',
        indicator: 'bg-primary',
      },
      amber: {
        root: 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600',
        indicator:
          'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 shadow-md border-r-2 border-amber-600',
      },
      gold: {
        root: 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600',
        indicator:
          'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500 shadow-lg border-r-2 border-yellow-600',
      },
    };

    const currentVariant = variantClasses[variant];
    const progressValue = value || 0;

    return (
      <div className='space-y-2'>
        {/* Label and percentage */}
        {(label || showPercentage) && (
          <div className='flex justify-between items-center text-sm'>
            {label && (
              <span className='font-medium text-gray-700 dark:text-gray-300'>
                {label}
              </span>
            )}
            {showPercentage && (
              <span className='font-semibold text-amber-600 dark:text-amber-400'>
                {Math.round(progressValue)}%
              </span>
            )}
          </div>
        )}

        {/* Progress bar container */}
        <div className='relative'>
          <ProgressPrimitive.Root
            ref={ref}
            className={cn(
              'relative w-full overflow-hidden rounded-full transition-all duration-300',
              sizeClasses[size],
              currentVariant.root,
              className
            )}
            {...props}
          >
            <ProgressPrimitive.Indicator
              className={cn(
                'h-full w-full flex-1 transition-all duration-300 ease-out relative',
                currentVariant.indicator
              )}
              style={{ transform: `translateX(-${100 - progressValue}%)` }}
            />
          </ProgressPrimitive.Root>

          {/* Progress markers */}
          {showMarkers && (
            <div className='absolute inset-0 flex justify-between items-center px-1'>
              {[25, 50, 75].map((marker) => (
                <div
                  key={marker}
                  className={cn(
                    'w-0.5 h-full bg-gray-400 dark:bg-gray-500',
                    progressValue >= marker && 'bg-white/60'
                  )}
                  style={{ left: `${marker}%` }}
                />
              ))}
            </div>
          )}

          {/* Progress value indicator */}
          {progressValue > 5 && (
            <div
              className='absolute top-0 h-full flex items-center'
              style={{ left: `${Math.min(progressValue, 95)}%` }}
            >
              <div className='w-1 h-full bg-white/80 shadow-sm' />
            </div>
          )}
        </div>

        {/* Progress description */}
        {progressValue > 0 && (
          <div className='text-xs text-gray-600 dark:text-gray-400 text-center'>
            {progressValue < 25 && 'Getting started'}
            {progressValue >= 25 && progressValue < 50 && 'Making progress'}
            {progressValue >= 50 && progressValue < 75 && 'Halfway there'}
            {progressValue >= 75 && progressValue < 100 && 'Almost complete'}
            {progressValue >= 100 && 'Complete'}
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
