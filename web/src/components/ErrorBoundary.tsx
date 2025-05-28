import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='p-6 max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-md'>
          <div className='flex items-center text-red-500 mb-4'>
            <AlertTriangle className='h-6 w-6 mr-2' />
            <h2 className='text-xl font-bold'>Something went wrong</h2>
          </div>

          <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800'>
            <p className='text-sm font-mono text-red-800 dark:text-red-300 overflow-auto'>
              {this.state.error?.message || 'An unknown error occurred'}
            </p>
          </div>

          <Button onClick={() => window.location.reload()} className='w-full'>
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
