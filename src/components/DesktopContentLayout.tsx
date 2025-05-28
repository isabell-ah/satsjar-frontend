import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DesktopContentLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
}

// Desktop-optimized content layout that prevents stretching
const DesktopContentLayout: React.FC<DesktopContentLayoutProps> = ({
  children,
  className,
  maxWidth = 'lg',
  centered = true,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md lg:max-w-lg',
    lg: 'max-w-md lg:max-w-2xl xl:max-w-4xl',
    xl: 'max-w-md lg:max-w-4xl xl:max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full',
        centered && 'mx-auto',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
};

interface DesktopButtonGroupProps {
  children: ReactNode;
  className?: string;
  variant?: 'inline' | 'grid' | 'stack';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

// Desktop-optimized button group that doesn't stretch
const DesktopButtonGroup: React.FC<DesktopButtonGroupProps> = ({
  children,
  className,
  variant = 'inline',
  maxWidth = 'md',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const variantClasses = {
    inline: 'flex flex-wrap gap-3 justify-center',
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4',
    stack: 'flex flex-col gap-3',
  };

  return (
    <div
      className={cn(
        'mx-auto',
        maxWidthClasses[maxWidth],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
};

interface DesktopProgressBarProps {
  value: number;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  showPercentage?: boolean;
}

// Desktop-optimized progress bar with max-width
const DesktopProgressBar: React.FC<DesktopProgressBarProps> = ({
  value,
  className,
  maxWidth = 'md',
  label,
  showPercentage = false,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className={cn('mx-auto', maxWidthClasses[maxWidth], className)}>
      {(label || showPercentage) && (
        <div className='flex justify-between text-sm mb-2'>
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(value)}%</span>}
        </div>
      )}
      <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
        <div
          className='bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300'
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
};

interface DesktopCardProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'sm' | 'md' | 'lg';
  centered?: boolean;
}

// Desktop-optimized card with proper max-width
const DesktopCard: React.FC<DesktopCardProps> = ({
  children,
  className,
  maxWidth = 'lg',
  padding = 'md',
  centered = true,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md lg:max-w-lg',
    lg: 'max-w-md lg:max-w-2xl xl:max-w-4xl',
    xl: 'max-w-md lg:max-w-4xl xl:max-w-6xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-4 lg:p-6',
    lg: 'p-6 lg:p-8',
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm',
        centered && 'mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

export {
  DesktopContentLayout,
  DesktopButtonGroup,
  DesktopProgressBar,
  DesktopCard,
};

export default DesktopContentLayout;
