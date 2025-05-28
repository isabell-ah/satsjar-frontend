import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  variant?: 'cards' | 'metrics' | 'actions' | 'content';
  gap?: 'sm' | 'md' | 'lg';
}

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'metric' | 'action' | 'feature';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | 'desktop';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Responsive Grid Component
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  variant = 'cards',
  gap = 'md',
}) => {
  const gridClasses = {
    cards:
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    metrics:
      'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6',
    actions:
      'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6',
    content: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-3 lg:gap-4',
    md: 'gap-4 lg:gap-6 xl:gap-8',
    lg: 'gap-6 lg:gap-8 xl:gap-10',
  };

  return (
    <div className={cn(gridClasses[variant], gapClasses[gap], className)}>
      {children}
    </div>
  );
};

// Responsive Card Component
const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  clickable = false,
  onClick,
}) => {
  const baseClasses =
    'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200';

  const variantClasses = {
    default: 'p-4 lg:p-6 xl:p-8',
    metric: 'p-4 lg:p-5 xl:p-6 text-center',
    action:
      'p-6 lg:p-8 xl:p-10 flex flex-col items-center justify-center min-h-[120px] lg:min-h-[140px] xl:min-h-[160px]',
    feature: 'p-6 lg:p-8 xl:p-10',
  };

  const interactionClasses = cn(
    hover &&
      'hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50',
    clickable && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
    onClick && 'cursor-pointer'
  );

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        interactionClasses,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Responsive Container Component
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'full',
  padding = 'md',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md lg:max-w-2xl',
    lg: 'max-w-md lg:max-w-4xl xl:max-w-6xl',
    xl: 'max-w-md lg:max-w-6xl xl:max-w-7xl',
    '2xl': 'max-w-md lg:max-w-7xl xl:max-w-[1600px]',
    '3xl': 'max-w-md lg:max-w-[1600px] xl:max-w-[1800px]',
    desktop: 'max-w-md lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 md:px-4 lg:px-6',
    md: 'px-4 md:px-6 lg:px-8 xl:px-12',
    lg: 'px-6 md:px-8 lg:px-12 xl:px-16',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

// Responsive Section Component
interface ResponsiveSectionProps {
  children: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'none' | 'subtle' | 'card';
}

const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({
  children,
  className,
  spacing = 'md',
  background = 'none',
}) => {
  const spacingClasses = {
    sm: 'py-4 md:py-6',
    md: 'py-6 md:py-8 lg:py-10',
    lg: 'py-8 md:py-12 lg:py-16',
    xl: 'py-12 md:py-16 lg:py-20',
  };

  const backgroundClasses = {
    none: '',
    subtle: 'bg-gray-50/50 dark:bg-gray-900/50',
    card: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm',
  };

  return (
    <section
      className={cn(
        spacingClasses[spacing],
        backgroundClasses[background],
        className
      )}
    >
      {children}
    </section>
  );
};

// Responsive Columns Component
interface ResponsiveColumnsProps {
  children: ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

const ResponsiveColumns: React.FC<ResponsiveColumnsProps> = ({
  children,
  className,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
}) => {
  const gapClasses = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-3 md:gap-4 lg:gap-6',
    lg: 'gap-4 md:gap-6 lg:gap-8',
  };

  const columnClasses = cn(
    'grid',
    columns.sm && `grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    gapClasses[gap]
  );

  return <div className={cn(columnClasses, className)}>{children}</div>;
};

// Responsive Text Component
interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  responsive?: boolean;
}

const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  variant = 'body',
  responsive = true,
}) => {
  const variantClasses = {
    h1: responsive
      ? 'text-2xl lg:text-3xl xl:text-4xl font-bold'
      : 'text-4xl font-bold',
    h2: responsive
      ? 'text-xl lg:text-2xl xl:text-3xl font-bold'
      : 'text-3xl font-bold',
    h3: responsive
      ? 'text-lg lg:text-xl xl:text-2xl font-semibold'
      : 'text-2xl font-semibold',
    h4: responsive
      ? 'text-base lg:text-lg xl:text-xl font-semibold'
      : 'text-xl font-semibold',
    body: responsive ? 'text-sm lg:text-base' : 'text-base',
    caption: responsive
      ? 'text-xs lg:text-sm text-gray-600 dark:text-gray-400'
      : 'text-sm text-gray-600 dark:text-gray-400',
  };

  const Component = variant.startsWith('h')
    ? (variant as keyof JSX.IntrinsicElements)
    : 'p';

  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
};

export {
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveContainer,
  ResponsiveSection,
  ResponsiveColumns,
  ResponsiveText,
};

export default ResponsiveGrid;
