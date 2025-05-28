import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useAgeTheme } from './AgeBasedTheme';
import { cn } from '@/lib/utils';

interface AgeAwareProgressProps {
  value: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showGlow?: boolean;
  showPercentage?: boolean;
  showEmoji?: boolean;
  label?: string;
  goalName?: string;
  celebrateCompletion?: boolean;
}

export const AgeAwareProgress: React.FC<AgeAwareProgressProps> = ({
  value,
  className,
  size = 'md',
  animated = true,
  showGlow = true,
  showPercentage = false,
  showEmoji = true,
  label,
  goalName,
  celebrateCompletion = true,
}) => {
  const { theme, currentAge } = useAgeTheme();
  const isCompleted = value >= 100;
  
  // Determine variant based on age
  const variant = currentAge && currentAge <= 12 ? 'young' : 'teen';
  
  // Age-appropriate emojis and messages
  const getProgressEmoji = () => {
    if (!showEmoji) return '';
    
    if (isCompleted) {
      return currentAge && currentAge <= 12 ? '🎉🌟' : '🏆✨';
    }
    
    if (value >= 75) {
      return currentAge && currentAge <= 12 ? '🚀' : '⚡';
    }
    
    if (value >= 50) {
      return currentAge && currentAge <= 12 ? '💪' : '📈';
    }
    
    if (value >= 25) {
      return currentAge && currentAge <= 12 ? '🌱' : '🎯';
    }
    
    return currentAge && currentAge <= 12 ? '🌟' : '💫';
  };

  const getProgressMessage = () => {
    if (isCompleted) {
      return currentAge && currentAge <= 12 
        ? `Amazing! You completed ${goalName || 'your goal'}! 🎉`
        : `Goal achieved! Well done! 🏆`;
    }
    
    if (value >= 75) {
      return currentAge && currentAge <= 12 
        ? "You're almost there! Keep going! 🚀"
        : "Excellent progress! Nearly there! ⚡";
    }
    
    if (value >= 50) {
      return currentAge && currentAge <= 12 
        ? "Halfway there! You're doing great! 💪"
        : "Great progress! Keep it up! 📈";
    }
    
    if (value >= 25) {
      return currentAge && currentAge <= 12 
        ? "Good start! Keep saving! 🌱"
        : "Good progress! Stay focused! 🎯";
    }
    
    return currentAge && currentAge <= 12 
      ? "Just getting started! You can do it! 🌟"
      : "Getting started! Keep going! 💫";
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label and percentage */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className={cn(
              'font-medium',
              currentAge && currentAge <= 12 ? 'text-base font-bold' : 'text-sm font-semibold'
            )}>
              {label} {getProgressEmoji()}
            </span>
          )}
          {showPercentage && (
            <span className={cn(
              'text-muted-foreground',
              currentAge && currentAge <= 12 ? 'text-sm font-semibold' : 'text-xs'
            )}>
              {Math.round(value)}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className={cn(
        'relative',
        currentAge && currentAge <= 12 ? 'progress-container' : '',
        isCompleted && celebrateCompletion && currentAge && currentAge <= 12 && 'progress-complete-young',
        isCompleted && celebrateCompletion && currentAge && currentAge > 12 && 'progress-complete-teen'
      )}>
        <Progress
          value={value}
          variant={variant}
          size={size}
          animated={animated}
          showGlow={showGlow}
          className={cn(
            'transition-all duration-500',
            currentAge && currentAge <= 12 && 'progress-interactive',
            currentAge && currentAge <= 12 ? 'goal-progress-young' : 'goal-progress-teen'
          )}
        />
        
        {/* Completion celebration overlay */}
        {isCompleted && celebrateCompletion && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'font-bold text-white drop-shadow-lg animate-bounce',
              currentAge && currentAge <= 12 ? 'text-lg' : 'text-sm'
            )}>
              {currentAge && currentAge <= 12 ? '🎉 DONE! 🎉' : '✨ COMPLETE ✨'}
            </span>
          </div>
        )}
      </div>

      {/* Progress message */}
      {(value > 0 || isCompleted) && (
        <p className={cn(
          'text-center transition-all duration-300',
          currentAge && currentAge <= 12 
            ? 'text-sm font-semibold text-pink-600 dark:text-pink-400' 
            : 'text-xs text-indigo-600 dark:text-indigo-400',
          isCompleted && 'animate-pulse'
        )}>
          {getProgressMessage()}
        </p>
      )}
    </div>
  );
};

// Level progress component specifically for level indicators
export const AgeLevelProgress: React.FC<{
  currentLevel: number;
  progress: number;
  className?: string;
}> = ({ currentLevel, progress, className }) => {
  const { currentAge } = useAgeTheme();
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-xs text-white/80">
        <span>Level {currentLevel}</span>
        <span>Level {currentLevel + 1}</span>
      </div>
      
      <div className={cn(
        'relative',
        currentAge && currentAge <= 12 ? 'level-progress-young' : 'level-progress-teen'
      )}>
        <Progress
          value={progress}
          variant={currentAge && currentAge <= 12 ? 'young' : 'teen'}
          size="sm"
          animated={true}
          showGlow={true}
          className="h-3"
        />
      </div>
      
      <p className={cn(
        'text-center text-white/70',
        currentAge && currentAge <= 12 ? 'text-sm font-bold' : 'text-xs'
      )}>
        {currentAge && currentAge <= 12 
          ? `${Math.round(progress)}% to next level! 🌟`
          : `${Math.round(progress)}% to level up ⚡`
        }
      </p>
    </div>
  );
};

// Goal progress component with enhanced features
export const AgeGoalProgress: React.FC<{
  goalName: string;
  current: number;
  target: number;
  className?: string;
  showActions?: boolean;
  onContribute?: () => void;
}> = ({ goalName, current, target, className, showActions = false, onContribute }) => {
  const { currentAge } = useAgeTheme();
  const progress = (current / target) * 100;
  const remaining = target - current;
  
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className={cn(
            'font-medium',
            currentAge && currentAge <= 12 ? 'text-base font-bold' : 'text-sm font-semibold'
          )}>
            {goalName}
          </h4>
          <p className={cn(
            'text-muted-foreground',
            currentAge && currentAge <= 12 ? 'text-sm' : 'text-xs'
          )}>
            {current.toLocaleString()} / {target.toLocaleString()} sats
          </p>
        </div>
        <div className="text-right">
          <div className={cn(
            'font-bold',
            currentAge && currentAge <= 12 
              ? 'text-lg text-pink-600 dark:text-pink-400' 
              : 'text-sm text-indigo-600 dark:text-indigo-400'
          )}>
            {Math.round(progress)}%
          </div>
          <div className={cn(
            'text-muted-foreground',
            currentAge && currentAge <= 12 ? 'text-xs' : 'text-xs'
          )}>
            {remaining.toLocaleString()} left
          </div>
        </div>
      </div>

      <AgeAwareProgress
        value={progress}
        goalName={goalName}
        showEmoji={true}
        celebrateCompletion={true}
        size="md"
      />

      {showActions && onContribute && progress < 100 && (
        <div className="flex justify-center mt-3">
          <button
            onClick={onContribute}
            className={cn(
              'px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105',
              currentAge && currentAge <= 12
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md'
            )}
          >
            {currentAge && currentAge <= 12 ? '🪙 Add Coins!' : '💰 Contribute'}
          </button>
        </div>
      )}
    </div>
  );
};
