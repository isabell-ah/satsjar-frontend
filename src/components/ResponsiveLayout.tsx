import React, { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Home,
  Coins,
  Award,
  History,
  Book,
  LogOut,
  Menu,
  X,
  User,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  onClick?: () => void;
  active?: boolean;
}

interface ResponsiveLayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onShowAchievements?: () => void;
  onShowHistory?: () => void;
  onShowLearning?: () => void;
  onLogout?: () => void;
  userRole?: 'child' | 'parent';
  userName?: string;
  hideBottomNav?: boolean;
  navigationItems?: NavigationItem[];
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  activeTab = 'home',
  onTabChange,
  onShowAchievements,
  onShowHistory,
  onShowLearning,
  onLogout,
  userRole = 'child',
  userName = 'User',
  hideBottomNav = false,
  navigationItems,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Default navigation items based on user role
  const defaultChildNavigation: NavigationItem[] = [
    {
      id: 'home',
      name: 'Home',
      icon: Home,
      onClick: () => onTabChange?.('home'),
      active: activeTab === 'home',
    },
    {
      id: 'savings',
      name: 'Savings',
      icon: Coins,
      onClick: () => onTabChange?.('savings'),
      active: activeTab === 'savings',
    },
  ];

  const defaultParentNavigation: NavigationItem[] = [
    {
      id: 'overview',
      name: 'Home',
      icon: Home,
      onClick: () => onTabChange?.('overview'),
      active: activeTab === 'overview',
    },
    {
      id: 'savings',
      name: 'Savings',
      icon: Coins,
      onClick: () => onTabChange?.('savings'),
      active: activeTab === 'savings',
    },
    {
      id: 'children',
      name: 'Children',
      icon: User,
      onClick: () => onTabChange?.('children'),
      active: activeTab === 'children',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      onClick: () => onTabChange?.('settings'),
      active: activeTab === 'settings',
    },
  ];

  const navItems =
    navigationItems ||
    (userRole === 'parent' ? defaultParentNavigation : defaultChildNavigation);

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className='flex flex-col h-full'>
      {/* Enhanced Logo/Header for Child */}
      <div
        className={`flex items-center flex-shrink-0 px-6 py-4 border-b ${
          userRole === 'child'
            ? 'border-amber-200/30 dark:border-amber-700/20 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-900/20 dark:to-yellow-900/20'
            : 'border-white/10 dark:border-white/5'
        }`}
      >
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center'>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg transition-all duration-300 hover:scale-110 ${
                userRole === 'child'
                  ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 border border-amber-300/50 shadow-amber-200/50 dark:shadow-amber-900/50'
                  : 'bg-gradient-to-br from-amber-500 to-yellow-600 border border-amber-300/30'
              }`}
            >
              <Coins
                className={`h-6 w-6 text-white drop-shadow-sm ${
                  userRole === 'child' ? 'animate-pulse-lightning' : ''
                }`}
              />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1
                  className={`text-lg font-bold transition-colors duration-300 ${
                    userRole === 'child'
                      ? 'text-amber-900 dark:text-amber-100'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {userRole === 'child' ? '🌟 Sats Jar' : 'Sats Jar'}
                </h1>
                <p
                  className={`text-xs transition-colors duration-300 ${
                    userRole === 'child'
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {userName}'s {userRole === 'parent' ? 'Family' : 'Adventure'}{' '}
                  🚀
                </p>
              </div>
            )}
          </div>
          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`h-8 w-8 p-0 transition-all duration-300 hover:scale-110 ${
                    userRole === 'child'
                      ? 'hover:bg-amber-100/50 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      : 'hover:bg-white/10 dark:hover:bg-white/5'
                  }`}
                >
                  <Menu className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p>
                  {sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Enhanced Navigation for Child */}
      <nav
        className={`flex-1 px-4 py-4 space-y-3 overflow-y-auto ${
          userRole === 'child'
            ? 'bg-gradient-to-b from-transparent to-amber-50/20 dark:to-amber-900/10'
            : ''
        }`}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.active || activeTab === item.id;

          const NavigationButton = (
            <button
              key={item.id}
              onClick={() => {
                item.onClick?.();
                if (isMobile) setSidebarOpen(false);
              }}
              className={cn(
                'group flex items-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105',
                userRole === 'child' && 'hover:shadow-md',
                isActive
                  ? userRole === 'child'
                    ? 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 text-amber-900 dark:text-amber-100 shadow-lg border border-amber-300/50 dark:border-amber-600/30 transform scale-105'
                    : 'bg-active-gold-subtle text-amber-900 dark:text-amber-100 shadow-active-tab border border-amber-200/50 dark:border-amber-700/30'
                  : userRole === 'child'
                  ? 'text-amber-700 dark:text-amber-300 hover:bg-amber-50/50 hover:text-amber-900 dark:hover:bg-amber-900/20 dark:hover:text-amber-100'
                  : 'text-gray-600 hover:bg-white/10 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'
              )}
              style={
                userRole === 'child'
                  ? {
                      animationDelay: `${index * 100}ms`,
                    }
                  : {}
              }
            >
              <div className={`relative ${sidebarCollapsed ? 'mr-0' : 'mr-3'}`}>
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all duration-300',
                    isActive
                      ? userRole === 'child'
                        ? 'scale-125 text-amber-600 dark:text-amber-400 drop-shadow-md animate-pulse-lightning'
                        : 'scale-110 text-amber-600 dark:text-amber-400 drop-shadow-sm'
                      : userRole === 'child'
                      ? 'group-hover:scale-110 group-hover:text-amber-600 dark:group-hover:text-amber-400'
                      : 'group-hover:scale-105'
                  )}
                />
                {/* Sparkle effect for active child navigation */}
                {userRole === 'child' && isActive && (
                  <div className='absolute -inset-1 bg-gradient-to-r from-amber-300/30 to-yellow-300/30 rounded-full animate-pulse'></div>
                )}
              </div>
              {!sidebarCollapsed && (
                <span
                  className={cn(
                    'transition-all duration-300',
                    isActive && 'font-semibold',
                    userRole === 'child' && isActive && 'text-shadow-sm'
                  )}
                >
                  {userRole === 'child' && item.name === 'Home'
                    ? '🏠 Home'
                    : userRole === 'child' && item.name === 'Savings'
                    ? '💰 Savings'
                    : item.name}
                </span>
              )}
              {/* Fun indicator for child active tab */}
              {userRole === 'child' && isActive && !sidebarCollapsed && (
                <div className='ml-auto'>
                  <div className='w-2 h-2 bg-amber-500 rounded-full animate-bounce'></div>
                </div>
              )}
            </button>
          );

          // Wrap with enhanced tooltip when sidebar is collapsed
          if (sidebarCollapsed) {
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>{NavigationButton}</TooltipTrigger>
                <TooltipContent
                  side='right'
                  className={`sidebar-tooltip ${
                    userRole === 'child'
                      ? 'bg-amber-900 dark:bg-amber-100 text-white dark:text-amber-900 border-amber-700 dark:border-amber-300'
                      : ''
                  }`}
                >
                  <p>
                    {userRole === 'child' && item.name === 'Home'
                      ? '🏠 Home'
                      : userRole === 'child' && item.name === 'Savings'
                      ? '💰 Savings'
                      : item.name}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return NavigationButton;
        })}

        {/* Fun motivational element for children */}
        {userRole === 'child' && !sidebarCollapsed && (
          <div className='mt-6 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30'>
            <div className='text-center'>
              <div className='text-2xl mb-1'>🎯</div>
              <p className='text-xs font-medium text-blue-800 dark:text-blue-200'>
                Keep Saving!
              </p>
              <p className='text-xs text-blue-600 dark:text-blue-400'>
                You're doing great!
              </p>
            </div>
          </div>
        )}
      </nav>

      {/* Enhanced User Section & Logout for Child */}
      <div
        className={`flex-shrink-0 border-t p-4 ${
          userRole === 'child'
            ? 'border-amber-200/30 dark:border-amber-700/20 bg-gradient-to-r from-amber-50/30 to-yellow-50/30 dark:from-amber-900/20 dark:to-yellow-900/20'
            : 'border-white/10 dark:border-white/5'
        }`}
      >
        {!sidebarCollapsed && (
          <div className='flex items-center mb-4'>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mr-3 shadow-md transition-all duration-300 hover:scale-110 ${
                userRole === 'child'
                  ? 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 border border-blue-300/50 shadow-blue-200/50 dark:shadow-blue-900/50'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600 border border-blue-300/30'
              }`}
            >
              <User
                className={`h-5 w-5 text-white drop-shadow-sm ${
                  userRole === 'child' ? 'animate-pulse-lightning' : ''
                }`}
              />
            </div>
            <div className='flex-1 min-w-0'>
              <p
                className={`text-sm font-semibold truncate transition-colors duration-300 ${
                  userRole === 'child'
                    ? 'text-amber-900 dark:text-amber-100'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {userRole === 'child' ? `🌟 ${userName}` : userName}
              </p>
              <p
                className={`text-xs capitalize transition-colors duration-300 ${
                  userRole === 'child'
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {userRole === 'child'
                  ? 'Super Saver 🚀'
                  : `${userRole} Account`}
              </p>
            </div>
            {/* Fun level indicator for children */}
            {userRole === 'child' && (
              <div className='bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full'>
                <span className='text-xs font-bold text-amber-800 dark:text-amber-200'>
                  Lv.3
                </span>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Logout Button */}
        {sidebarCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  onLogout?.();
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`group flex items-center justify-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 ${
                  userRole === 'child'
                    ? 'text-orange-600 hover:bg-orange-50/20 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20 dark:hover:text-orange-300'
                    : 'text-red-600 hover:bg-red-50/10 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
                }`}
              >
                <LogOut className='h-5 w-5 group-hover:scale-105 transition-transform duration-300' />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side='right'
              className={`sidebar-tooltip ${
                userRole === 'child'
                  ? 'bg-amber-900 dark:bg-amber-100 text-white dark:text-amber-900 border-amber-700 dark:border-amber-300'
                  : ''
              }`}
            >
              <p>{userRole === 'child' ? '👋 See you later!' : 'Logout'}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => {
              onLogout?.();
              if (isMobile) setSidebarOpen(false);
            }}
            className={`group flex items-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 ${
              userRole === 'child'
                ? 'text-orange-600 hover:bg-orange-50/20 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20 dark:hover:text-orange-300 hover:shadow-md'
                : 'text-red-600 hover:bg-red-50/10 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
            }`}
          >
            <LogOut className='h-5 w-5 mr-3 group-hover:scale-105 transition-transform duration-300' />
            {userRole === 'child' ? '👋 See you later!' : 'Logout'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        {/* No Mobile Header - Let dashboards handle their own mobile layout */}

        <div className='flex'>
          {/* Desktop Sidebar - Simple and Effective */}
          <div
            className={cn(
              'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-50 transition-all duration-300',
              sidebarCollapsed ? 'lg:w-16' : 'lg:w-60'
            )}
          >
            <div className='flex flex-col flex-grow sidebar-glass'>
              <SidebarContent />
            </div>
          </div>

          {/* No Mobile Sidebar - Let dashboards handle their own mobile navigation */}

          {/* Main Content - Clean and Simple */}
          <div
            className={cn(
              'flex flex-col flex-1 min-h-screen transition-all duration-200',
              sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'
            )}
          >
            <div
              className={cn(
                'flex-1 w-full max-w-none p-4 lg:p-6',
                !hideBottomNav && 'pb-20 lg:pb-6'
              )}
            >
              {children}
            </div>
          </div>
        </div>

        {/* No Bottom Navigation - Let dashboards handle their own mobile navigation */}
      </div>
    </TooltipProvider>
  );
};

export default ResponsiveLayout;
