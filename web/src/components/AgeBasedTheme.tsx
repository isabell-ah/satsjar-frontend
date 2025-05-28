import React, { createContext, useContext, useEffect, useState } from 'react';

// Age-based theme configuration
export interface AgeTheme {
  ageGroup: 'young' | 'teen';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    background: string;
    cardBackground: string;
  };
  animations: {
    duration: string;
    easing: string;
    intensity: 'high' | 'medium' | 'low';
  };
  typography: {
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
  };
  spacing: {
    padding: string;
    margin: string;
    borderRadius: string;
  };
  effects: {
    shadows: string;
    glows: string;
    borders: string;
  };
}

// Theme configurations for different age groups
const youngTheme: AgeTheme = {
  ageGroup: 'young',
  colors: {
    primary: '#f59e0b', // Gold/amber primary
    secondary: '#fbbf24', // Bright amber
    accent: '#45b7d1',
    success: '#10b981', // Emerald green
    warning: '#f97316', // Orange
    background: 'linear-gradient(135deg, #f59e0b, #fbbf24, #4ecdc4)',
    cardBackground:
      'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.1), rgba(78, 205, 196, 0.1))',
  },
  animations: {
    duration: '300ms',
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    intensity: 'high',
  },
  typography: {
    fontSize: '1.125rem',
    fontWeight: '700',
    lineHeight: '1.4',
  },
  spacing: {
    padding: '1.5rem',
    margin: '1rem',
    borderRadius: '1.5rem',
  },
  effects: {
    shadows: '0 8px 25px rgba(255, 107, 107, 0.3)',
    glows: '0 0 20px rgba(78, 205, 196, 0.4)',
    borders: '4px dashed #ff6b6b',
  },
};

const teenTheme: AgeTheme = {
  ageGroup: 'teen',
  colors: {
    primary: '#d97706', // Darker amber/gold
    secondary: '#92400e', // Deep amber
    accent: '#f093fb',
    success: '#059669', // Emerald
    warning: '#ea580c', // Orange
    background: 'linear-gradient(135deg, #d97706, #92400e, #667eea)',
    cardBackground:
      'linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(146, 64, 14, 0.08), rgba(102, 126, 234, 0.1))',
  },
  animations: {
    duration: '500ms',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    intensity: 'medium',
  },
  typography: {
    fontSize: '1rem',
    fontWeight: '600',
    lineHeight: '1.5',
  },
  spacing: {
    padding: '1.25rem',
    margin: '0.75rem',
    borderRadius: '0.75rem',
  },
  effects: {
    shadows: '0 10px 30px rgba(102, 126, 234, 0.3)',
    glows: '0 0 25px rgba(240, 147, 251, 0.4)',
    borders: '1px solid rgba(102, 126, 234, 0.3)',
  },
};

// Theme context
interface AgeThemeContextType {
  theme: AgeTheme;
  setAge: (age: number) => void;
  currentAge: number | null;
}

const AgeThemeContext = createContext<AgeThemeContextType | undefined>(
  undefined
);

// Theme provider component
export const AgeThemeProvider: React.FC<{
  children: React.ReactNode;
  initialAge?: number;
}> = ({ children, initialAge }) => {
  const [currentAge, setCurrentAge] = useState<number | null>(
    initialAge || null
  );
  const [theme, setTheme] = useState<AgeTheme>(teenTheme);

  const setAge = (age: number) => {
    setCurrentAge(age);
    setTheme(age <= 12 ? youngTheme : teenTheme);
  };

  useEffect(() => {
    if (initialAge) {
      setAge(initialAge);
    }
  }, [initialAge]);

  // Apply theme CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;

    // Set CSS custom properties
    root.style.setProperty('--child-primary', theme.colors.primary);
    root.style.setProperty('--child-secondary', theme.colors.secondary);
    root.style.setProperty('--child-accent', theme.colors.accent);
    root.style.setProperty('--child-success', theme.colors.success);
    root.style.setProperty('--child-warning', theme.colors.warning);
    root.style.setProperty('--child-background', theme.colors.background);
    root.style.setProperty('--child-card-bg', theme.colors.cardBackground);

    root.style.setProperty(
      '--child-animation-duration',
      theme.animations.duration
    );
    root.style.setProperty('--child-animation-easing', theme.animations.easing);

    root.style.setProperty('--child-font-size', theme.typography.fontSize);
    root.style.setProperty('--child-font-weight', theme.typography.fontWeight);
    root.style.setProperty('--child-line-height', theme.typography.lineHeight);

    root.style.setProperty('--child-padding', theme.spacing.padding);
    root.style.setProperty('--child-margin', theme.spacing.margin);
    root.style.setProperty('--child-border-radius', theme.spacing.borderRadius);

    root.style.setProperty('--child-shadow', theme.effects.shadows);
    root.style.setProperty('--child-glow', theme.effects.glows);
    root.style.setProperty('--child-border', theme.effects.borders);

    // Add age-specific class to body
    document.body.classList.remove('child-young', 'child-teen');
    document.body.classList.add(`child-${theme.ageGroup}`);

    return () => {
      // Cleanup
      document.body.classList.remove('child-young', 'child-teen');
    };
  }, [theme]);

  return (
    <AgeThemeContext.Provider value={{ theme, setAge, currentAge }}>
      {children}
    </AgeThemeContext.Provider>
  );
};

// Hook to use age theme
export const useAgeTheme = () => {
  const context = useContext(AgeThemeContext);
  if (context === undefined) {
    throw new Error('useAgeTheme must be used within an AgeThemeProvider');
  }
  return context;
};

// Age-aware component wrapper
export const AgeAwareComponent: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style = {} }) => {
  const { theme } = useAgeTheme();

  const ageClass = `child-${theme.ageGroup}`;
  const combinedClassName = `${ageClass} ${className}`.trim();

  return (
    <div className={combinedClassName} style={style}>
      {children}
    </div>
  );
};

// Age-specific button component
export const AgeButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}) => {
  const { theme } = useAgeTheme();

  const baseClass =
    theme.ageGroup === 'young' ? 'child-button-young' : 'child-button-teen';
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const variantStyles = {
    primary: { backgroundColor: theme.colors.primary },
    secondary: { backgroundColor: theme.colors.secondary },
    accent: { backgroundColor: theme.colors.accent },
  };

  return (
    <button
      className={`${baseClass} ${sizeClasses[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      style={variantStyles[variant]}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Age-specific card component
export const AgeCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  const { theme } = useAgeTheme();

  const baseClass =
    theme.ageGroup === 'young' ? 'child-card-young' : 'child-card-teen';
  const interactiveClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClass} ${interactiveClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Age-specific achievement badge
export const AgeAchievementBadge: React.FC<{
  children: React.ReactNode;
  earned?: boolean;
  className?: string;
}> = ({ children, earned = false, className = '' }) => {
  const { theme } = useAgeTheme();

  const baseClass =
    theme.ageGroup === 'young'
      ? 'child-achievement-young'
      : 'child-achievement-teen';
  const earnedClass = earned ? '' : 'opacity-50 grayscale';

  return (
    <div
      className={`${baseClass} ${earnedClass} ${className} w-16 h-16 rounded-full flex items-center justify-center`}
    >
      {children}
    </div>
  );
};

// Utility function to get age-appropriate emojis and text
export const getAgeAppropriateContent = (age: number | null) => {
  const isYoung = age !== null && age <= 12;

  return {
    emojis: {
      money: isYoung ? '🪙' : '💰',
      goal: isYoung ? '🎯' : '🏆',
      achievement: isYoung ? '🌟' : '🏅',
      learning: isYoung ? '📚' : '🎓',
      celebration: isYoung ? '🎉' : '✨',
      growth: isYoung ? '🌱' : '📈',
    },
    messages: {
      welcome: isYoung ? 'Hey there, superstar! 🌟' : 'Welcome back! 👋',
      goalComplete: isYoung
        ? 'Awesome job! You did it! 🎉'
        : 'Goal achieved! Well done! 🏆',
      keepSaving: isYoung
        ? "Keep saving, you're amazing! 💪"
        : 'Great progress on your savings! 📈',
      newAchievement: isYoung
        ? 'You earned a new badge! 🌟'
        : 'New achievement unlocked! 🏅',
    },
    buttonText: {
      addMoney: isYoung ? 'Add Coins! 🪙' : 'Add Funds 💰',
      viewGoals: isYoung ? 'My Goals! 🎯' : 'View Goals 🏆',
      learn: isYoung ? 'Learn & Play! 📚' : 'Learn & Earn 🎓',
      achievements: isYoung ? 'My Badges! 🌟' : 'Achievements 🏅',
    },
  };
};
