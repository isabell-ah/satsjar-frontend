import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '0.5rem',
        sm: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2.5rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        bitcoin: '#f7931a',
        lightning: '#8b5cf6',
        mpesa: '#4ade80',
        satsjar: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          darkblue: '#1e40af',
        },
        // Age-specific color schemes for children
        child: {
          // Ages 6-12: Bright, playful colors
          young: {
            primary: '#ff6b6b',
            secondary: '#4ecdc4',
            accent: '#45b7d1',
            success: '#96ceb4',
            warning: '#feca57',
            purple: '#a55eea',
            pink: '#fd79a8',
            orange: '#fd9644',
            blue: '#74b9ff',
            green: '#00b894',
          },
          // Ages 13-17: Modern, trendy colors
          teen: {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#f093fb',
            success: '#4facfe',
            warning: '#43e97b',
            purple: '#a8edea',
            pink: '#fed6e3',
            orange: '#ffecd2',
            blue: '#a8e6cf',
            green: '#88d8a3',
          },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'pulse-lightning': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.4)',
          },
          '50%': {
            opacity: '0.9',
            boxShadow: '0 0 0 12px rgba(139, 92, 246, 0)',
          },
        },
        lightning: {
          '0%': { opacity: '0' },
          '20%': { opacity: '0.8' },
          '22%': { opacity: '0.1' },
          '24%': { opacity: '0.9' },
          '30%': { opacity: '0.4' },
          '35%': { opacity: '0.9' },
          '100%': { opacity: '1' },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-out': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
        },
        'scale-in': {
          '0%': {
            transform: 'scale(0.95)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-5px)',
          },
        },
        // Child-specific animations
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'bounce-fun': {
          '0%, 100%': {
            transform: 'translateY(0) scale(1)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-25%) scale(1.05)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        'pulse-fun': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.1)',
            opacity: '0.8',
          },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(255, 107, 107, 0.5)',
          },
          '50%': {
            boxShadow:
              '0 0 20px rgba(255, 107, 107, 0.8), 0 0 30px rgba(255, 107, 107, 0.6)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-lightning': 'pulse-lightning 2s infinite',
        lightning: 'lightning 2s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        bounce: 'bounce 1s ease-in-out infinite',
        // Child-specific animations
        wiggle: 'wiggle 1s ease-in-out infinite',
        'bounce-fun': 'bounce-fun 2s ease-in-out infinite',
        'pulse-fun': 'pulse-fun 2s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out',
        'float-gentle': 'float-gentle 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      // Glass morphism and enhanced UI
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        hover:
          '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        button: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
        'button-hover': '0 6px 20px rgba(0, 0, 0, 0.15)',
        sidebar:
          '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'sidebar-dark':
          '0 10px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'active-tab':
          '0 4px 20px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(245, 158, 11, 0.2)',
      },
      backgroundColor: {
        glass: 'rgba(15, 77, 116, 0.53)',
        'glass-dark': 'rgba(15, 77, 116, 0.53)',
        'glass-light': 'rgba(255, 255, 255, 0.85)',
        'glass-button-light': 'rgba(255, 255, 255, 0.95)',
        'glass-button-dark': 'rgba(15, 23, 42, 0.85)',
        'glass-jar-light': 'rgba(255, 255, 255, 0.9)',
        'glass-jar-dark': 'rgba(15, 23, 42, 0.7)',
        'sidebar-glass-light': 'rgba(255, 255, 255, 0.95)',
        'sidebar-glass-dark': 'rgba(15, 23, 42, 0.95)',
        'active-gold': 'rgba(245, 158, 11, 0.1)',
        'active-gold-dark': 'rgba(245, 158, 11, 0.15)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      backgroundImage: {
        'gradient-satsjar':
          'linear-gradient(145deg, #3b82f6,rgb(6, 150, 117)246, 210))',
        'glass-gradient':
          'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
        'glass-gradient-light':
          'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
        'glass-gradient-dark':
          'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))',
        'sidebar-glass':
          'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
        'sidebar-glass-dark':
          'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85))',
        'active-gold': 'linear-gradient(135deg, #f59e0b, #d97706)',
        'active-gold-subtle':
          'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
