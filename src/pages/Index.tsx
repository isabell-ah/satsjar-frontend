import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import HomePage from '@/components/HomePage';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import ParentDashboard from '@/components/ParentDashboard';
import ChildDashboard from '@/components/ChildDashboard';
import LightningPayment from '@/components/LightningPayment';
import MpesaPayment from '@/components/MpesaPayment';
import TransactionHistory from '@/components/TransactionHistory';
import GoalSetting from '@/components/GoalSetting';
import ChildAchievementsPage from '@/pages/ChildAchievementsPage';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import EnhancedLearningHub from '@/components/EnhancedLearningHub';
import WithdrawDeposit from '@/components/WithdrawDeposit';
import ManageChildren from '@/components/ManageChildren';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/UserAuthContext';

type Section =
  | 'home'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'lightning'
  | 'mpesa'
  | 'history'
  | 'goals'
  | 'achievements'
  | 'learning'
  | 'withdraw-deposit'
  | 'manage-children';

const MainApp = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<Section>('login');
  const [balance, setBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // If user is authenticated, show dashboard
    if (isAuthenticated) {
      setCurrentSection('dashboard');
      updateBalance();
    } else {
      // Show homepage by default when not authenticated
      setCurrentSection('home');
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setCurrentSection('login');
  };

  const updateBalance = async () => {
    setIsLoadingBalance(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (user?.role === 'child') {
        // Child view gets a randomized balance with some educational value
        setBalance(Math.floor(Math.random() * 800) + 200);
      } else {
        // Parent sees the full balance
        setBalance(Math.floor(Math.random() * 10000) + 1000);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleAddFunds = (childId: string) => {
    setSelectedChildId(childId);
    setCurrentSection('lightning');
  };

  const renderSection = () => {
    if (!isAuthenticated) {
      switch (currentSection) {
        case 'login':
          return (
            <div className='p-4'>
              <LoginForm />
              <div className='text-center mt-4 space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  Don't have an account?{' '}
                  <button
                    className='text-primary hover:underline'
                    onClick={() => setCurrentSection('register')}
                  >
                    Register
                  </button>
                </p>

                <div className='pt-2 border-t'>
                  <Button
                    variant='outline'
                    className='mt-2 w-full'
                    onClick={() => navigate('/about')}
                  >
                    Learn More About Sats_Jar
                  </Button>
                </div>
              </div>
            </div>
          );
        case 'register':
          return (
            <div className='p-4'>
              <RegisterForm onLogin={() => setCurrentSection('login')} />
            </div>
          );
        case 'home':
        default:
          return <HomePage onGetStarted={() => setCurrentSection('login')} />;
      }
    }

    switch (currentSection) {
      case 'dashboard':
        return user?.role === 'parent' ? (
          <ParentDashboard />
        ) : (
          <ChildDashboard
            onShowLightning={() => setCurrentSection('lightning')}
            onShowHistory={() => setCurrentSection('history')}
            onShowGoals={() => setCurrentSection('goals')}
            onShowLearning={() => setCurrentSection('learning')}
            onShowAchievements={() => setCurrentSection('achievements')}
            onLogout={handleLogout}
          />
        );
      case 'lightning':
        return (
          <LightningPayment
            onBack={() => {
              console.log('Index: Going back to dashboard from lightning');
              setCurrentSection('dashboard');
            }}
            childId={selectedChildId}
          />
        );
      case 'mpesa':
        return (
          <MpesaPayment
            onBack={() => {
              console.log('Index: Going back to dashboard from mpesa');
              setCurrentSection('dashboard');
            }}
            childId={selectedChildId}
          />
        );
      case 'withdraw-deposit':
        return (
          <WithdrawDeposit onBack={() => setCurrentSection('dashboard')} />
        );
      case 'history':
        return (
          <TransactionHistory onBack={() => setCurrentSection('dashboard')} />
        );
      case 'goals':
        return <GoalSetting onBack={() => setCurrentSection('dashboard')} />;
      case 'achievements':
        return (
          <ChildAchievementsPage
            onBack={() => setCurrentSection('dashboard')}
          />
        );
      case 'learning':
        return (
          <EnhancedLearningHub onBack={() => setCurrentSection('dashboard')} />
        );
      case 'manage-children':
        return (
          <ManageChildren
            onBack={() => setCurrentSection('dashboard')}
            onFundChild={handleAddFunds}
            onViewChildDashboard={() => setCurrentSection('dashboard')}
          />
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-gray-50 dark:from-background dark:to-gray-900/50 transition-colors duration-300'>
      <div className='max-w-md mx-auto lg:max-w-4xl xl:max-w-6xl'>
        <header className='p-4 text-center relative'>
          <div className='absolute top-4 right-4'>
            <ThemeToggle />
          </div>
          <h1
            className='text-2xl font-bold cursor-pointer hover:text-amber-600 transition-colors'
            onClick={() => setCurrentSection('home')}
          >
            Sats_Jar
          </h1>
          <p className='text-muted-foreground text-sm'>
            Learn to save with Bitcoin
          </p>

          {/* Show user role badge when authenticated */}
          {isAuthenticated && user && (
            <div className='mt-2'>
              <span className='bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 text-xs font-medium px-2.5 py-0.5 rounded-full'>
                {user.role === 'parent' ? 'Parent Account' : 'Child Account'}
              </span>
              <span className='text-xs text-gray-500 dark:text-gray-400 ml-2'>
                {user.name}
              </span>
            </div>
          )}
        </header>

        {renderSection()}
      </div>
    </div>
  );
};

const Index = () => {
  // Since UserAuthProvider is already in App.tsx, we don't need it here
  return (
    <>
      <MainApp />
      <Toaster />
    </>
  );
};

export default Index;
