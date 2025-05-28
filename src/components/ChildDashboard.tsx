import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import {
  RefreshCcw,
  Star,
  Book,
  Award,
  History,
  Zap,
  Coins,
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  CheckCircle2,
  Home,
  LogOut,
  Target,
  Trophy,
  Clock,
  PiggyBank,
  TrendingUp,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/UserAuthContext';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChildGrowthChart from './ChildGrowthChart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  walletApi,
  goalsApi,
  educationApi,
  achievementsApi,
} from '@/services/api';
import AddFundsModal from './AddFundsModal';
import GoalsManagement from './GoalsManagement';
import TransactionHistory from './TransactionHistory';
import { useNavigate } from 'react-router-dom';
import SavingsPlans from './SavingsPlans';
import ResponsiveLayout from './ResponsiveLayout';
import {
  DesktopContentLayout,
  DesktopButtonGroup,
  DesktopProgressBar,
} from './DesktopContentLayout';

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  status: 'approved' | 'pending' | 'completed';
  deletionRequested?: boolean;
}

interface ChildDashboardProps {
  childData?: any;
  onShowLightning: () => void;
  onShowMpesa?: () => void;
  onShowHistory?: () => void;
  onShowGoals?: () => void;
  onShowLearning?: () => void;
  onShowAchievements?: () => void;
  onLogout?: () => void;
  isParentView?: boolean;
  hideBottomNav?: boolean;
}

const ChildDashboard = ({
  childData,
  onShowLightning,
  onShowMpesa,
  onShowHistory,
  onShowGoals,
  onShowLearning,
  onShowAchievements,
  onLogout,
  isParentView = false,
  hideBottomNav = false,
}: ChildDashboardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balance, setBalance] = useState(
    childData?.balance || user?.balance || 0
  );

  const [activeTab, setActiveTab] = useState('home');
  const [savingsTab, setSavingsTab] = useState('summary');
  const [expandedGoals, setExpandedGoals] = useState<string[]>([]);

  // Add state for goals
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [newGoalData, setNewGoalData] = useState({
    name: '',
    target: 0,
    description: '',
  });

  // Goal contribution state
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  // Add state for modals
  const [showLightningModal, setShowLightningModal] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Add state for the AddFundsModal
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'lightning' | 'mpesa'
  >('lightning');
  const navigate = useNavigate();

  // Add state for goals expansion
  const [isGoalsExpanded, setIsGoalsExpanded] = useState(false);

  // Add state for goal creation modal
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Add state for achievements
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);

  // Use child data if provided
  const childName = childData?.name || user?.name || 'My';

  // Sync balance with user context when user data changes
  useEffect(() => {
    if (user?.role === 'child' && user?.balance !== undefined && !childData) {
      // For direct child login, use the balance from user context
      setBalance(user.balance);
    }
  }, [user, childData]);

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoadingBalance(true);
      try {
        // If this is a child viewing their own dashboard, use the direct endpoint
        // If this is a parent viewing a child's dashboard, use the parent endpoint with childId
        let balanceData;

        if (user?.role === 'child') {
          // Child's own balance (token identifies them)
          balanceData = await walletApi.getBalance();
        } else if (childData?.id) {
          // Parent viewing child's balance
          try {
            // First try the parent-specific endpoint if it exists
            balanceData = await walletApi.getBalance(childData.id);
          } catch (error) {
            console.error('Error with getBalance(childId):', error);
            // Fallback to regular balance endpoint
            balanceData = await walletApi.getBalance();
          }
        } else {
          // Fallback
          balanceData = { balance: childData?.balance || 850 };
        }

        const newBalance = balanceData.balance || 0;
        setBalance(newBalance);
      } catch (error) {
        console.error('Error fetching balance:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch balance',
        });
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [user, childData]);

  // Enhanced goal fetching with better error handling and retry logic
  useEffect(() => {
    const fetchGoals = async () => {
      // Determine which child ID to use:
      // 1. If childData.id exists (parent viewing child), use that
      // 2. If user is a child (direct child login), use user.id
      // 3. Otherwise, don't fetch goals
      const targetChildId =
        childData?.id || (user?.role === 'child' ? user.id : null);

      if (targetChildId) {
        setIsLoadingGoals(true);

        try {
          // Use the primary goals API
          const goalsData = await goalsApi.getSavingsGoals(targetChildId);

          // Handle different response formats
          let goalsArray = [];
          if (Array.isArray(goalsData)) {
            goalsArray = goalsData;
          } else if (goalsData && Array.isArray(goalsData.goals)) {
            goalsArray = goalsData.goals;
          } else if (
            goalsData &&
            goalsData.data &&
            Array.isArray(goalsData.data)
          ) {
            goalsArray = goalsData.data;
          }

          // Process goals data with proper field mapping
          const processedGoals = goalsArray.map((goal: any) => ({
            id: goal.id,
            name: goal.name,
            target: goal.targetAmount || goal.target || 0,
            current: goal.currentAmount || goal.current || 0,
            status: goal.approved
              ? goal.completed || goal.currentAmount >= goal.targetAmount
                ? 'completed'
                : 'approved'
              : 'pending',
            deletionRequested: goal.deletionRequested || false,
          }));

          setGoals(processedGoals);
        } catch (error) {
          console.error(
            `Error fetching goals for child ${targetChildId}:`,
            error
          );
          toast({
            variant: 'destructive',
            title: 'Goal Loading Error',
            description: `Failed to load goals. ${
              isParentView
                ? 'Child may not have any goals yet.'
                : 'Please try refreshing.'
            }`,
          });
          // Set empty goals array on error
          setGoals([]);
        } finally {
          setIsLoadingGoals(false);
        }
      } else {
        setGoals([]);
        setIsLoadingGoals(false);
      }
    };

    // Add a small delay to ensure component is fully mounted
    const timeoutId = setTimeout(fetchGoals, 100);
    return () => clearTimeout(timeoutId);
  }, [childData, user, isParentView]);

  // Fetch achievements on component mount
  useEffect(() => {
    const fetchAchievements = async () => {
      const targetChildId =
        childData?.id || (user?.role === 'child' ? user.id : null);

      if (targetChildId) {
        setIsLoadingAchievements(true);
        try {
          let achievementsResponse;

          // If this is a child logged in directly (no childData), use getMyAchievements
          // If this is a parent viewing a child (has childData), use getChildAchievements
          if (!childData && user?.role === 'child') {
            achievementsResponse = await achievementsApi.getMyAchievements();
          } else {
            achievementsResponse = await achievementsApi.getChildAchievements(
              targetChildId
            );
          }

          setAchievements(achievementsResponse.achievements || []);
        } catch (error) {
          console.error('Error fetching achievements:', error);
          // Don't show error toast for achievements as it's not critical
          setAchievements([]);
        } finally {
          setIsLoadingAchievements(false);
        }
      } else {
        setAchievements([]);
      }
    };

    fetchAchievements();
  }, [childData, user]);

  // Calculate KES equivalent - 1 sat = 0.03 KES (example rate)
  const exchangeRate = 0.03;
  const kesAmount = balance * exchangeRate;

  const handleRefreshBalance = async () => {
    setIsLoadingBalance(true);

    toast({
      title: 'Updating your jar...',
      description: 'Checking your latest savings!',
    });

    try {
      // Use the same logic as in fetchBalance useEffect
      let balanceData;

      if (user?.role === 'child') {
        // Child's own balance (token identifies them)
        balanceData = await walletApi.getBalance();
      } else if (childData?.id) {
        // Parent viewing child's balance
        balanceData = await walletApi.getBalance(childData.id);
      } else {
        // Fallback
        balanceData = { balance: childData?.balance || 0 };
      }

      setBalance(balanceData.balance || 0);

      toast({
        title: 'Jar updated! 🎉',
        description: `Current balance: ${balanceData.balance || 0} sats`,
      });
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to refresh balance',
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Handle creating a new goal
  const handleCreateGoal = async () => {
    if (!newGoalData.name || newGoalData.target <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Goal',
        description: 'Please provide a name and a valid target amount',
      });
      return;
    }

    try {
      // Use same logic as fetchGoals for determining child ID
      const targetChildId =
        childData?.id || (user?.role === 'child' ? user.id : null);

      const response = await goalsApi.createSavingsGoal({
        name: newGoalData.name,
        targetAmount: newGoalData.target,
        description: newGoalData.description,
        childId: targetChildId,
      });

      toast({
        title: 'Goal Created',
        description: 'Your goal has been submitted for approval',
      });

      // Reset form
      setNewGoalData({
        name: '',
        target: 0,
        description: '',
      });

      // Auto-refresh goals to show the new goal
      await handleRefreshGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create goal',
      });
    }
  };

  // Handle manual refresh of goals
  const handleRefreshGoals = async () => {
    const targetChildId =
      childData?.id || (user?.role === 'child' ? user.id : null);

    if (targetChildId) {
      setIsLoadingGoals(true);
      try {
        const goalsData = await goalsApi.getSavingsGoals(targetChildId);
        setGoals(
          goalsData.map((goal: any) => ({
            id: goal.id,
            name: goal.name,
            target: goal.targetAmount,
            current: goal.currentAmount,
            status: goal.approved
              ? goal.completed
                ? 'completed'
                : 'approved'
              : 'pending',
            deletionRequested: goal.deletionRequested || false,
          }))
        );

        toast({
          title: 'Goals Refreshed',
          description: 'Your goals have been updated successfully',
        });
      } catch (error) {
        console.error('Error refreshing goals:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to refresh goals',
        });
      } finally {
        setIsLoadingGoals(false);
      }
    }
  };

  // Enhanced refresh function for savings summary
  const handleRefreshSavingsSummary = async () => {
    const isRefreshing = isLoadingBalance || isLoadingGoals;
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes

    try {
      // Refresh both balance and goals data simultaneously
      await Promise.all([handleRefreshBalance(), handleRefreshGoals()]);

      toast({
        title: 'Savings summary refreshed! 🎉',
        description: 'All data has been updated',
      });
    } catch (error) {
      console.error('Error refreshing savings summary:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to refresh savings summary',
      });
    }
  };

  // Handle opening contribution modal
  const handleOpenContributeModal = (goal: any) => {
    setSelectedGoal(goal);
    setContributionAmount('');
    setShowContributeModal(true);
  };

  // Handle contributing to a goal
  const handleContributeToGoal = async () => {
    if (!selectedGoal || !contributionAmount) return;

    const amount = parseInt(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid contribution amount',
      });
      return;
    }

    if (amount > balance) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: `You only have ${balance} sats available`,
      });
      return;
    }

    try {
      await goalsApi.contributeToGoal(selectedGoal.id, amount);

      // Auto-refresh goals and balance after contribution
      await handleRefreshGoals();
      await handleRefreshBalance();

      // Close modal and reset
      setShowContributeModal(false);
      setSelectedGoal(null);
      setContributionAmount('');

      toast({
        title: 'Contribution Successful! 🎉',
        description: `You've added ${amount} sats to "${selectedGoal.name}"!`,
      });
    } catch (error) {
      console.error('Error contributing to goal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to contribute to goal',
      });
    }
  };

  // Handle deleting a goal - request parent approval
  const handleDeleteGoal = async (goalId: string, goalName: string) => {
    try {
      // Update the goal to mark it for deletion (requires parent approval)
      await goalsApi.updateGoal(goalId, {
        deletionRequested: true,
        deletionRequestedAt: new Date().toISOString(),
      });

      toast({
        title: 'Goal Deletion Requested',
        description: `Request to delete "${goalName}" has been submitted for parent approval. The goal will remain visible until approved.`,
      });

      // Auto-refresh goals to show updated deletion status
      await handleRefreshGoals();
    } catch (error) {
      console.error('Error requesting goal deletion:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to request goal deletion',
      });
    }
  };

  // Get the first approved goal or the first goal if none are approved
  const currentGoal = useMemo(() => {
    // First try to find an approved goal
    const approvedGoal = goals.find((goal) => goal.status === 'approved');

    // If no approved goal, use the first goal of any status
    const firstGoal = goals.length > 0 ? goals[0] : null;

    // Use the approved goal if found, otherwise use the first goal
    const selectedGoal = approvedGoal || firstGoal;

    // If we have a goal, return it in the expected format
    if (selectedGoal) {
      return {
        id: selectedGoal.id,
        name: selectedGoal.name,
        target: selectedGoal.target,
        current: selectedGoal.current,
        status: selectedGoal.status,
      };
    }

    // If no goals exist, return a default empty goal
    return {
      id: 'default',
      name: 'No active goal',
      target: 100,
      current: 0,
      status: 'none',
    };
  }, [goals]);

  // Calculate goal progress based on the current goal
  const goalProgress = useMemo(() => {
    return currentGoal.target > 0
      ? (currentGoal.current / currentGoal.target) * 100
      : 0;
  }, [currentGoal]);

  // Calculate savings statistics - use actual data from goals array
  const completedGoalsCount = goals.filter(
    (goal) => goal.status === 'completed'
  ).length;
  // Include both pending creation and pending deletion goals
  const pendingGoalsCount = goals.filter(
    (goal) => goal.status === 'pending' || goal.deletionRequested === true
  ).length;
  const approvedGoalsCount = goals.filter(
    (goal) => goal.status === 'approved' && !goal.deletionRequested
  ).length;
  // Use actual balance for total saved, not goal contributions
  const totalSaved = balance;

  const achievementBadges = useMemo(() => {
    const badges = [];

    // Define achievement types and their corresponding badges
    const achievementTypes = {
      first_deposit: {
        name: 'First Saver',
        icon: <Coins className='h-5 w-5' />,
        description: 'Made first deposit',
      },
      quiz_perfect: {
        name: 'Quiz Master',
        icon: <Book className='h-5 w-5' />,
        description: 'Perfect quiz score',
      },
      first_lesson: {
        name: 'Learning Star',
        icon: <Book className='h-5 w-5' />,
        description: 'Completed first lesson',
      },
      module_completed: {
        name: 'Module Master',
        icon: <Award className='h-5 w-5' />,
        description: 'Completed learning module',
      },
      goal_achieved: {
        name: 'Goal Achiever',
        icon: <Star className='h-5 w-5' />,
        description: 'Reached savings goal',
      },
      saving_streak: {
        name: 'Saving Streak',
        icon: <Award className='h-5 w-5' />,
        description: 'Consistent saver',
      },
    };

    // Add earned achievements
    achievements.forEach((achievement) => {
      const badgeConfig =
        achievementTypes[achievement.type as keyof typeof achievementTypes];
      if (badgeConfig) {
        badges.push({
          id: achievement.id,
          ...badgeConfig,
          unlocked: true,
          earnedDate: achievement.awarded,
        });
      }
    });

    // Add potential achievements based on child's data
    const hasBalance = balance > 0;
    const hasCompletedGoals = goals.some((g) => g.status === 'completed');
    const earnedTypes = achievements.map((a) => a.type);

    // First Saver - if has balance but no achievement yet
    if (hasBalance && !earnedTypes.includes('first_deposit')) {
      badges.push({
        id: 'potential_first_deposit',
        ...achievementTypes.first_deposit,
        unlocked: false,
      });
    }

    // Goal Achiever - if has completed goals but no achievement yet
    if (hasCompletedGoals && !earnedTypes.includes('goal_achieved')) {
      badges.push({
        id: 'potential_goal_achieved',
        ...achievementTypes.goal_achieved,
        unlocked: false,
      });
    }

    // Add some default potential achievements if none exist
    if (badges.length === 0) {
      badges.push(
        {
          id: 'potential_first_deposit',
          ...achievementTypes.first_deposit,
          unlocked: false,
        },
        {
          id: 'potential_quiz_perfect',
          ...achievementTypes.quiz_perfect,
          unlocked: false,
        },
        {
          id: 'potential_goal_achieved',
          ...achievementTypes.goal_achieved,
          unlocked: false,
        }
      );
    }

    // Limit to 4 badges for display in child dashboard
    return badges.slice(0, 4);
  }, [achievements, balance, goals]);

  // Progress calculation
  const level = Math.floor(balance / 200) + 1;
  const levelProgress = ((balance % 200) / 200) * 100;

  // Toggle goal expansion
  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  // Update the handler functions to properly navigate
  const handleShowLightning = () => {
    console.log('ChildDashboard: Opening Add Funds modal');
    if (typeof onShowLightning === 'function') {
      onShowLightning();
    } else {
      // If no handler is provided, show the modal directly with both payment options
      setShowAddFundsModal(true);
      // Don't pre-select any payment method so both options are shown
    }
  };

  const handleShowMpesa = () => {
    console.log('ChildDashboard: Navigating to mpesa payment');
    if (typeof onShowMpesa === 'function') {
      onShowMpesa();
    } else {
      // If no handler is provided, show the modal directly
      setShowAddFundsModal(true);
      // Pre-select M-Pesa as the payment method
      setSelectedPaymentMethod('mpesa');
    }
  };

  const handleShowGoals = () => {
    console.log('ChildDashboard: Navigating to goals');
    if (typeof onShowGoals === 'function') {
      onShowGoals();
    } else {
      // Determine the correct child ID for navigation
      const targetChildId =
        childData?.id || (user?.role === 'child' ? user.id : null);
      if (targetChildId) {
        navigate(`/child-dashboard/${targetChildId}/goals`, {
          state: {
            fromParentView: isParentView || !!childData?.id,
            childData: childData,
          },
        });
      } else {
        navigate('/goals');
      }
    }
  };

  const handleShowLearning = () => {
    console.log('ChildDashboard: Navigating to learning');
    if (typeof onShowLearning === 'function') {
      onShowLearning();
    } else {
      // Determine the correct child ID for navigation
      const targetChildId =
        childData?.id || (user?.role === 'child' ? user.id : null);
      if (targetChildId) {
        navigate(`/child-dashboard/${targetChildId}/learning`, {
          state: {
            fromParentView: isParentView || !!childData?.id,
            childData: childData,
          },
        });
      } else {
        navigate('/learning');
      }
    }
  };

  const handleShowHistory = () => {
    console.log('ChildDashboard: Navigating to history');
    if (typeof onShowHistory === 'function') {
      onShowHistory();
    } else {
      // Determine the correct child ID for navigation
      const targetChildId =
        childData?.id || (user?.role === 'child' ? user.id : null);
      if (targetChildId) {
        navigate(`/child-dashboard/${targetChildId}/history`, {
          state: {
            fromParentView: isParentView || !!childData?.id,
            childData: childData,
          },
        });
      } else {
        navigate('/history');
      }
    }
  };

  const handleShowAchievements = () => {
    console.log('ChildDashboard: Navigating to achievements');
    if (typeof onShowAchievements === 'function') {
      onShowAchievements();
    } else {
      // Determine the correct child ID for navigation
      const targetChildId =
        childData?.id || (user?.role === 'child' ? user.id : null);
      if (targetChildId) {
        navigate(`/child-dashboard/${targetChildId}/achievements`);
      } else {
        navigate('/achievements');
      }
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Keep the current savingsTab when switching to savings section
    // Default is already set to 'summary' in useState
  };

  // Add the AddFundsModal component to the JSX
  return (
    <ResponsiveLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={onLogout}
      userRole='child'
      userName={childName}
      hideBottomNav={hideBottomNav}
    >
      <DesktopContentLayout maxWidth='xl'>
        <div className='space-y-6 animate-fade-in bg-gradient-to-br from-blue-50 to-amber-50 dark:from-background dark:to-gray-900/50 p-4 lg:p-6 xl:p-8 rounded-lg'>
          {/* Simplified Dashboard Header */}
          <div className='bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-xl p-4 shadow-lg mb-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='bg-white/20 p-2 rounded-lg mr-3 backdrop-blur-sm'>
                  <PiggyBank className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-xl font-bold text-white'>
                    Welcome back, {childName}!
                  </h1>
                  <p className='text-blue-100 text-sm'>
                    {isParentView
                      ? 'Parent viewing dashboard'
                      : 'Ready to save and learn?'}
                  </p>
                </div>
              </div>

              {/* Simple Stats */}
              <div className='hidden md:flex items-center gap-3'>
                <div className='text-right'>
                  <div className='text-lg font-bold text-white'>
                    {balance.toLocaleString()}
                  </div>
                  <div className='text-xs text-blue-100'>Total Sats</div>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='bg-white/20 text-white border-white/30 hover:bg-white/30'
                  onClick={handleRefreshBalance}
                  disabled={isLoadingBalance}
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${
                      isLoadingBalance ? 'animate-spin' : ''
                    }`}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Animated Jar Header */}
          <Card className='overflow-hidden border-0 shadow-glass hover:shadow-glass-lg transition-all duration-300 hover:transform hover:-translate-y-1'>
            <div className='bg-gradient-to-br from-amber-400 to-yellow-500 dark:from-amber-500 dark:to-amber-700 p-6'>
              <div className='flex justify-between items-start'>
                <div>
                  <h2 className='text-xl font-bold text-white drop-shadow-sm'>
                    {childName}'s Savings Jar
                  </h2>
                  <Badge
                    variant='outline'
                    className='text-xs text-white border-white/30 bg-white/20 mt-1'
                  >
                    {isParentView ? 'Parent View' : 'Level 3 Saver'}
                  </Badge>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='bg-white/20 text-white border-white/30 hover:bg-white/30 md:hidden'
                  onClick={handleRefreshBalance}
                  disabled={isLoadingBalance}
                >
                  <RefreshCcw className='mr-2 h-4 w-4' />
                  Update
                </Button>
              </div>

              <div className='mt-6 flex flex-col items-center justify-center'>
                <div className='relative'>
                  {/* Animated Jar - Enhanced with better outline */}
                  <div className='w-32 h-40 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-lg relative overflow-hidden jar-outline shadow-glass hover:shadow-glass-lg transition-all duration-300'>
                    {/* Fill level based on balance */}
                    <div
                      className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-300 via-amber-300 to-amber-400 transition-all duration-1000 shadow-inner'
                      style={{
                        height: `${Math.min(90, (balance / 2000) * 100)}%`,
                      }}
                    ></div>

                    {/* Coins visual */}
                    <div className='absolute bottom-2 left-0 right-0 flex justify-center items-end'>
                      <div className='relative'>
                        <Coins className='h-5 w-5 text-yellow-600 drop-shadow-md absolute -left-8 bottom-0' />
                        <Coins className='h-4 w-4 text-yellow-600 drop-shadow-md absolute -left-3 bottom-2' />
                        <Coins className='h-6 w-6 text-yellow-600 drop-shadow-md animate-pulse-lightning' />
                        <Coins className='h-4 w-4 text-yellow-600 drop-shadow-md absolute -right-3 bottom-2' />
                        <Coins className='h-5 w-5 text-yellow-600 drop-shadow-md absolute -right-8 bottom-0' />
                      </div>
                    </div>
                  </div>

                  {/* Balance displayed on top */}
                  <div className='absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 rounded-full px-4 py-1 shadow-lg border border-amber-200 dark:border-amber-700'>
                    {isLoadingBalance ? (
                      <span className='loading mr-1'></span>
                    ) : (
                      <div className='text-center'>
                        <span className='font-bold text-amber-600 dark:text-amber-400'>
                          {balance} sats
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* KES equivalent moved below jar */}
                <div className='mt-3 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-full shadow-sm border border-amber-100 dark:border-amber-800/30'>
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    ≈ KES {kesAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Level Progress Bar */}
              <div className='mt-6'>
                <div className='flex justify-between text-xs text-white/80 mb-1'>
                  <span>Level {level}</span>
                  <span>Level {level + 1}</span>
                </div>
                <Progress value={levelProgress} className='h-2 bg-white/20' />
              </div>
            </div>
          </Card>

          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid grid-cols-2 w-full mb-4'>
              <TabsTrigger value='home'>Home</TabsTrigger>
              <TabsTrigger value='savings'>Savings</TabsTrigger>
            </TabsList>

            <TabsContent value='home' className='space-y-6'>
              {/* Action Buttons Grid - Age Appropriate */}
              {/* Mobile: Compact buttons with enhanced glassmorphism */}
              <div className='grid grid-cols-2 gap-4 lg:hidden'>
                <Button
                  className='bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 h-auto py-4 flex flex-col items-center gap-2 shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 dark:border-white/10 text-white font-medium'
                  onClick={onShowGoals}
                >
                  <Star className='h-5 w-5 drop-shadow-sm' />
                  <span className='text-xs font-semibold drop-shadow-sm'>
                    Set Goals
                  </span>
                </Button>

                <Button
                  className='bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-auto py-4 flex flex-col items-center gap-2 shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 dark:border-white/10 text-white font-medium'
                  onClick={onShowHistory}
                >
                  <History className='h-5 w-5 drop-shadow-sm' />
                  <span className='text-xs font-semibold drop-shadow-sm'>
                    My History
                  </span>
                </Button>

                <Button
                  className='bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-auto py-4 flex flex-col items-center gap-2 shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 dark:border-white/10 text-white font-medium'
                  onClick={() => {
                    setShowAddFundsModal(true);
                    // Don't pre-select any payment method so both options are shown
                  }}
                >
                  <Zap className='h-5 w-5 drop-shadow-sm' />
                  <span className='text-xs font-semibold drop-shadow-sm'>
                    Add Funds
                  </span>
                </Button>

                <Button
                  className='bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 h-auto py-4 flex flex-col items-center gap-2 shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 dark:border-white/10 text-white font-medium'
                  onClick={onShowLearning}
                >
                  <Book className='h-5 w-5 drop-shadow-sm' />
                  <span className='text-xs font-semibold drop-shadow-sm'>
                    Learn & Earn
                  </span>
                </Button>
              </div>

              {/* Desktop: Centered buttons with enhanced glassmorphism */}
              <DesktopButtonGroup
                variant='grid'
                maxWidth='xl'
                className='hidden lg:grid'
              >
                <Button
                  className='bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 h-auto py-6 flex flex-col items-center gap-3 shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 dark:border-white/10 text-white font-medium'
                  onClick={onShowGoals}
                >
                  <Star className='h-7 w-7 drop-shadow-sm' />
                  <span className='font-semibold drop-shadow-sm'>
                    Set Goals
                  </span>
                </Button>

                <Button
                  className='bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-auto py-6 flex flex-col items-center gap-3 shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 dark:border-white/10 text-white font-medium'
                  onClick={onShowHistory}
                >
                  <History className='h-7 w-7 drop-shadow-sm' />
                  <span className='font-semibold drop-shadow-sm'>
                    My History
                  </span>
                </Button>

                <Button
                  className='bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-auto py-6 flex flex-col items-center gap-3 shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 dark:border-white/10 text-white font-medium'
                  onClick={() => {
                    setShowAddFundsModal(true);
                    // Don't pre-select any payment method so both options are shown
                  }}
                >
                  <Zap className='h-7 w-7 drop-shadow-sm' />
                  <span className='font-semibold drop-shadow-sm'>
                    Add Funds
                  </span>
                </Button>

                <Button
                  className='bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 h-auto py-6 flex flex-col items-center gap-3 shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 dark:border-white/10 text-white font-medium'
                  onClick={onShowLearning}
                >
                  <Book className='h-7 w-7 drop-shadow-sm' />
                  <span className='font-semibold drop-shadow-sm'>
                    Learn & Earn
                  </span>
                </Button>
              </DesktopButtonGroup>

              {/* Growth Chart - NEW ADDITION */}
              <ChildGrowthChart
                balance={balance}
                goals={goals}
                achievements={achievements}
                childId={
                  childData?.id || (user?.role === 'child' ? user.id : null)
                }
              />

              {/* Enhanced Current Goal Card */}
              <Card className='border-0 bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-green-900/50 shadow-glass hover:shadow-glass-lg transition-all duration-300 hover:transform hover:-translate-y-1 overflow-hidden'>
                <CardHeader className='bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white pb-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-xl flex items-center'>
                        <div className='bg-white/20 p-2 rounded-lg mr-3 backdrop-blur-sm'>
                          <Star className='h-6 w-6 drop-shadow-sm animate-pulse-lightning' />
                        </div>
                        🎯 My Current Goal
                      </CardTitle>
                      <p className='text-green-100 text-sm mt-1'>
                        {goals.length > 0
                          ? 'Keep saving to reach your dream! 💪'
                          : 'Ready to start your savings adventure? 🚀'}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      {goals.length > 0 &&
                        currentGoal.status === 'approved' && (
                          <div className='bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full'>
                            <span className='text-sm font-semibold'>
                              {Math.round(goalProgress)}% Done!
                            </span>
                          </div>
                        )}
                      <Button
                        variant='outline'
                        size='sm'
                        className='bg-white/20 text-white border-white/30 hover:bg-white/30'
                        onClick={handleRefreshGoals}
                        disabled={isLoadingGoals}
                      >
                        <RefreshCcw
                          className={`h-4 w-4 ${
                            isLoadingGoals ? 'animate-spin' : ''
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='p-6'>
                  {/* Debug info removed for cleaner user experience */}

                  {goals.length > 0 ? (
                    <div className='space-y-4'>
                      {/* Goal Header with Fun Styling */}
                      <div className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-xl border border-green-200/50 dark:border-green-700/30'>
                        <div className='flex items-center justify-between mb-3'>
                          <div>
                            <h3 className='text-lg font-bold text-green-900 dark:text-green-100 flex items-center'>
                              🌟 {currentGoal.name}
                              {currentGoal.status === 'approved' && (
                                <span className='ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce'>
                                  ACTIVE
                                </span>
                              )}
                            </h3>
                            <p className='text-sm text-green-700 dark:text-green-300'>
                              You're doing amazing! Keep it up! 🎉
                            </p>
                          </div>
                          <div className='text-right'>
                            <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                              {Math.round(goalProgress)}%
                            </div>
                            <div className='text-xs text-green-500 dark:text-green-400'>
                              Complete
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className='space-y-2'>
                          <div className='flex justify-between text-sm font-medium text-green-800 dark:text-green-200'>
                            <span>
                              💰 {currentGoal.current.toLocaleString()} sats
                              saved
                            </span>
                            <span>
                              🎯 Goal: {currentGoal.target.toLocaleString()}{' '}
                              sats
                            </span>
                          </div>
                          <div className='relative'>
                            <Progress
                              value={goalProgress}
                              variant='gold'
                              size='lg'
                              className='h-4 bg-green-100 dark:bg-green-800 border-2 border-green-300 dark:border-green-600 shadow-md'
                            />
                            {/* Fun progress indicator */}
                            {goalProgress > 10 && (
                              <div
                                className='absolute top-0 h-full flex items-center transition-all duration-500'
                                style={{
                                  left: `${Math.min(goalProgress - 5, 90)}%`,
                                }}
                              >
                                <div className='text-lg animate-bounce'>🚀</div>
                              </div>
                            )}
                          </div>
                          <div className='flex justify-between text-xs text-green-600 dark:text-green-400'>
                            <span>Started your journey!</span>
                            <span>
                              {(
                                currentGoal.target - currentGoal.current
                              ).toLocaleString()}{' '}
                              sats to go!
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {currentGoal.status === 'approved' && (
                        <div className='flex flex-col sm:flex-row gap-3'>
                          <Button
                            className='flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-105 py-3'
                            onClick={() =>
                              handleOpenContributeModal(currentGoal)
                            }
                          >
                            <Plus className='mr-2 h-4 w-4' />
                            💰 Add Sats to Goal
                          </Button>
                          <Button
                            variant='outline'
                            className='flex-1 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20 py-3'
                            onClick={() => setShowAddGoal(true)}
                          >
                            <Star className='mr-2 h-4 w-4' />
                            🎯 New Goal
                          </Button>
                        </div>
                      )}

                      {/* Motivational Message */}
                      <div className='bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-yellow-200/50 dark:border-yellow-700/30 text-center'>
                        <div className='text-2xl mb-2'>
                          {goalProgress >= 75
                            ? '🎉'
                            : goalProgress >= 50
                            ? '🌟'
                            : goalProgress >= 25
                            ? '💪'
                            : '🚀'}
                        </div>
                        <p className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
                          {goalProgress >= 75
                            ? "Almost there! You're a savings superstar!"
                            : goalProgress >= 50
                            ? "Halfway there! You're doing fantastic!"
                            : goalProgress >= 25
                            ? 'Great progress! Keep up the awesome work!'
                            : "Every sat counts! You've got this!"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30'>
                      <div className='mb-4'>
                        <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mb-4 animate-bounce-gentle'>
                          <Star className='h-10 w-10 text-white animate-pulse' />
                        </div>
                      </div>
                      <h3 className='text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2'>
                        Ready for Your First Goal? 🎯
                      </h3>
                      <p className='text-blue-700 dark:text-blue-300 mb-4 max-w-sm mx-auto'>
                        Set a savings goal and watch your money grow! Every
                        great journey starts with a single step! 🚀
                      </p>
                      <Button
                        className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-105 px-8 py-3'
                        onClick={() => setShowAddGoal(true)}
                      >
                        <Star className='mr-2 h-4 w-4' />
                        🎯 Create My First Goal!
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Super Enhanced My Achievements Section */}
              <Card className='border-0 bg-gradient-to-br from-white via-purple-50 to-pink-50 dark:from-slate-800 dark:via-purple-900/50 dark:to-pink-900/50 shadow-glass hover:shadow-glass-lg transition-all duration-300 hover:transform hover:-translate-y-1 overflow-hidden'>
                <CardHeader className='bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 dark:from-purple-600 dark:via-pink-600 dark:to-rose-600 text-white pb-4 relative overflow-hidden'>
                  {/* Animated background sparkles */}
                  <div className='absolute inset-0 opacity-20'>
                    <div className='absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-pulse'></div>
                    <div
                      className='absolute top-8 right-8 w-1 h-1 bg-white rounded-full animate-bounce'
                      style={{ animationDelay: '0.5s' }}
                    ></div>
                    <div
                      className='absolute bottom-6 left-12 w-1.5 h-1.5 bg-white rounded-full animate-pulse'
                      style={{ animationDelay: '1s' }}
                    ></div>
                    <div
                      className='absolute bottom-4 right-4 w-1 h-1 bg-white rounded-full animate-bounce'
                      style={{ animationDelay: '1.5s' }}
                    ></div>
                  </div>

                  <div className='flex items-center justify-between relative z-10'>
                    <div>
                      <CardTitle className='text-xl flex items-center'>
                        <div className='bg-white/20 p-2 rounded-lg mr-3 backdrop-blur-sm animate-pulse-lightning'>
                          <Award className='h-6 w-6 drop-shadow-sm' />
                        </div>
                        🏆 My Super Achievements
                      </CardTitle>
                      <p className='text-purple-100 text-sm mt-1'>
                        {achievements.length} awesome badge
                        {achievements.length !== 1 ? 's' : ''} earned • You're
                        incredible! ✨
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full animate-bounce-gentle'>
                        <span className='text-sm font-semibold'>
                          🌟 Level {Math.floor(achievements.length / 2) + 1}
                        </span>
                      </div>
                      {achievements.length > 0 && (
                        <div className='bg-yellow-400/90 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold animate-pulse'>
                          SUPERSTAR!
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='p-6'>
                  {isLoadingAchievements ? (
                    <div className='flex justify-center py-8'>
                      <div className='relative'>
                        <div className='animate-spin h-8 w-8 border-3 border-purple-200 border-t-purple-600 rounded-full'></div>
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <Award className='h-4 w-4 text-purple-600 animate-pulse' />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Super Fun Achievement Badges Grid */}
                      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                        {achievementBadges.map((achievement, index) => (
                          <div
                            key={achievement.id}
                            className={`group relative p-4 rounded-2xl border-2 transition-all duration-500 hover:scale-110 hover:shadow-xl hover:rotate-1 ${
                              achievement.unlocked
                                ? 'bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100 dark:from-yellow-900/40 dark:via-amber-900/40 dark:to-orange-800/40 border-yellow-300 dark:border-yellow-600 shadow-lg shadow-yellow-200/50 dark:shadow-yellow-900/50'
                                : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                            }`}
                            style={{
                              animationDelay: `${index * 150}ms`,
                            }}
                          >
                            {/* Fun floating elements for unlocked achievements */}
                            {achievement.unlocked && (
                              <>
                                <div
                                  className='absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce opacity-70'
                                  style={{ animationDelay: '0s' }}
                                ></div>
                                <div
                                  className='absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-bounce opacity-70'
                                  style={{ animationDelay: '0.3s' }}
                                ></div>
                                <div
                                  className='absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-bounce opacity-70'
                                  style={{ animationDelay: '0.6s' }}
                                ></div>
                              </>
                            )}

                            {/* Achievement Badge */}
                            <div className='flex flex-col items-center text-center relative z-10'>
                              <div
                                className={`relative h-20 w-20 rounded-full flex items-center justify-center mb-3 transition-all duration-500 group-hover:scale-125 ${
                                  achievement.unlocked
                                    ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 shadow-xl shadow-amber-300/50 dark:shadow-amber-900/50'
                                    : 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 group-hover:from-purple-300 group-hover:to-purple-400 dark:group-hover:from-purple-600 dark:group-hover:to-purple-700'
                                }`}
                              >
                                {/* Rotating ring for unlocked achievements */}
                                {achievement.unlocked && (
                                  <div
                                    className='absolute inset-0 rounded-full border-4 border-yellow-300 animate-spin opacity-30'
                                    style={{ animationDuration: '3s' }}
                                  ></div>
                                )}

                                <div
                                  className={`transition-all duration-500 text-2xl ${
                                    achievement.unlocked
                                      ? 'text-white drop-shadow-lg animate-pulse-lightning'
                                      : 'text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-300'
                                  }`}
                                >
                                  {achievement.icon}
                                </div>

                                {/* Success Indicator with celebration */}
                                {achievement.unlocked && (
                                  <div className='absolute -top-2 -right-2 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-white'>
                                    <CheckCircle2 className='h-4 w-4 text-white' />
                                  </div>
                                )}

                                {/* Sparkle Effect for Unlocked */}
                                {achievement.unlocked && (
                                  <>
                                    <div className='absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300/30 to-orange-300/30 animate-pulse'></div>
                                    <div className='absolute -inset-2 rounded-full bg-gradient-to-br from-yellow-200/20 to-orange-200/20 animate-ping'></div>
                                  </>
                                )}
                              </div>

                              {/* Achievement Info */}
                              <h4
                                className={`text-sm font-bold mb-1 ${
                                  achievement.unlocked
                                    ? 'text-amber-900 dark:text-amber-100 text-shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 group-hover:text-purple-700 dark:group-hover:text-purple-300'
                                }`}
                              >
                                {achievement.unlocked ? '✨ ' : '🔒 '}
                                {achievement.name}
                              </h4>
                              <p
                                className={`text-xs leading-relaxed ${
                                  achievement.unlocked
                                    ? 'text-amber-700 dark:text-amber-300'
                                    : 'text-gray-500 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                                }`}
                              >
                                {achievement.description}
                              </p>

                              {/* Earned Date with celebration */}
                              {achievement.unlocked &&
                                achievement.earnedDate && (
                                  <div className='mt-2 bg-gradient-to-r from-yellow-200 to-amber-200 dark:from-yellow-900/50 dark:to-amber-900/50 px-3 py-1 rounded-full border border-yellow-300 dark:border-yellow-600'>
                                    <span className='text-xs font-medium text-yellow-800 dark:text-yellow-200'>
                                      🎉{' '}
                                      {new Date(
                                        achievement.earnedDate
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}

                              {/* Coming Soon indicator for locked achievements */}
                              {!achievement.unlocked && (
                                <div className='mt-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-700'>
                                  <span className='text-xs font-medium text-purple-700 dark:text-purple-300'>
                                    🌟 Coming Soon!
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Super Fun Achievement Progress Section */}
                      <div className='bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-rose-900/30 p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-700 mb-6 relative overflow-hidden'>
                        {/* Animated background elements */}
                        <div
                          className='absolute top-2 right-2 w-4 h-4 bg-purple-300 rounded-full animate-bounce opacity-50'
                          style={{ animationDelay: '0s' }}
                        ></div>
                        <div
                          className='absolute bottom-2 left-2 w-3 h-3 bg-pink-300 rounded-full animate-bounce opacity-50'
                          style={{ animationDelay: '0.5s' }}
                        ></div>
                        <div
                          className='absolute top-1/2 right-4 w-2 h-2 bg-rose-300 rounded-full animate-bounce opacity-50'
                          style={{ animationDelay: '1s' }}
                        ></div>

                        <div className='flex items-center justify-between mb-4 relative z-10'>
                          <div className='flex items-center'>
                            <div className='bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl mr-4 shadow-lg animate-pulse-lightning'>
                              <Trophy className='h-6 w-6 text-white drop-shadow-sm' />
                            </div>
                            <div>
                              <h3 className='text-lg font-bold text-purple-900 dark:text-purple-100 flex items-center'>
                                🏆 Your Amazing Progress
                                {achievements.length > 0 && (
                                  <span className='ml-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full animate-bounce font-bold'>
                                    AWESOME!
                                  </span>
                                )}
                              </h3>
                              <p className='text-sm text-purple-700 dark:text-purple-300 font-medium'>
                                🌟 {achievements.length} of{' '}
                                {achievementBadges.length} super badges earned!
                              </p>
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                              {Math.round(
                                (achievements.length /
                                  achievementBadges.length) *
                                  100
                              )}
                              %
                            </div>
                            <div className='text-xs text-purple-600 dark:text-purple-400 font-semibold'>
                              Complete! 🎉
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className='relative mb-4'>
                          <Progress
                            value={
                              (achievements.length / achievementBadges.length) *
                              100
                            }
                            variant='gold'
                            size='lg'
                            className='h-6 bg-purple-200 dark:bg-purple-800 border-2 border-purple-300 dark:border-purple-600 shadow-md'
                          />
                          {/* Fun progress indicator */}
                          {achievements.length > 0 && (
                            <div
                              className='absolute top-0 h-full flex items-center transition-all duration-1000'
                              style={{
                                left: `${Math.min(
                                  (achievements.length /
                                    achievementBadges.length) *
                                    100 -
                                    5,
                                  90
                                )}%`,
                              }}
                            >
                              <div className='text-xl animate-bounce'>🎯</div>
                            </div>
                          )}
                        </div>

                        {/* Progress milestones */}
                        <div className='flex justify-between text-xs text-purple-600 dark:text-purple-400 font-medium'>
                          <span
                            className={
                              achievements.length >= 1
                                ? 'text-green-600 dark:text-green-400 font-bold'
                                : ''
                            }
                          >
                            {achievements.length >= 1 ? '✅' : '🎯'} First Badge
                          </span>
                          <span
                            className={
                              achievements.length >=
                              Math.ceil(achievementBadges.length / 2)
                                ? 'text-green-600 dark:text-green-400 font-bold'
                                : ''
                            }
                          >
                            {achievements.length >=
                            Math.ceil(achievementBadges.length / 2)
                              ? '✅'
                              : '🎯'}{' '}
                            Halfway Hero
                          </span>
                          <span
                            className={
                              achievements.length >= achievementBadges.length
                                ? 'text-green-600 dark:text-green-400 font-bold'
                                : ''
                            }
                          >
                            {achievements.length >= achievementBadges.length
                              ? '✅'
                              : '🎯'}{' '}
                            Badge Master
                          </span>
                        </div>
                      </div>

                      {/* Super Motivational Messages */}
                      {achievements.length === 0 ? (
                        <div className='text-center py-8 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-2xl border-2 border-blue-300 dark:border-blue-600 relative overflow-hidden'>
                          {/* Animated background elements */}
                          <div
                            className='absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-60'
                            style={{ animationDelay: '0s' }}
                          ></div>
                          <div
                            className='absolute top-6 right-6 w-2 h-2 bg-purple-400 rounded-full animate-bounce opacity-60'
                            style={{ animationDelay: '0.3s' }}
                          ></div>
                          <div
                            className='absolute bottom-4 left-8 w-2 h-2 bg-indigo-400 rounded-full animate-bounce opacity-60'
                            style={{ animationDelay: '0.6s' }}
                          ></div>
                          <div
                            className='absolute bottom-6 right-4 w-3 h-3 bg-pink-400 rounded-full animate-bounce opacity-60'
                            style={{ animationDelay: '0.9s' }}
                          ></div>

                          <div className='relative z-10'>
                            <div className='mb-6'>
                              <div className='inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full mb-4 animate-bounce-gentle shadow-xl'>
                                <Star className='h-12 w-12 text-white animate-pulse drop-shadow-lg' />
                              </div>
                            </div>
                            <h3 className='text-2xl font-bold text-blue-900 dark:text-blue-100 mb-3'>
                              Ready to Become a Savings Superstar? 🌟
                            </h3>
                            <p className='text-blue-700 dark:text-blue-300 mb-6 max-w-md mx-auto text-lg leading-relaxed'>
                              Your amazing adventure starts here! Complete fun
                              activities to earn awesome badges and become the
                              ultimate saver! 🚀
                            </p>
                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-6'>
                              <div className='bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700 p-4 rounded-xl border border-blue-300 dark:border-blue-600 hover:scale-105 transition-transform duration-300'>
                                <div className='text-2xl mb-2'>💰</div>
                                <span className='text-blue-900 dark:text-blue-100 font-bold text-sm'>
                                  Make Your First Deposit
                                </span>
                              </div>
                              <div className='bg-gradient-to-br from-green-200 to-green-300 dark:from-green-800 dark:to-green-700 p-4 rounded-xl border border-green-300 dark:border-green-600 hover:scale-105 transition-transform duration-300'>
                                <div className='text-2xl mb-2'>🎯</div>
                                <span className='text-green-900 dark:text-green-100 font-bold text-sm'>
                                  Set Your Dream Goal
                                </span>
                              </div>
                              <div className='bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-800 dark:to-purple-700 p-4 rounded-xl border border-purple-300 dark:border-purple-600 hover:scale-105 transition-transform duration-300'>
                                <div className='text-2xl mb-2'>📚</div>
                                <span className='text-purple-900 dark:text-purple-100 font-bold text-sm'>
                                  Learn Cool Stuff
                                </span>
                              </div>
                            </div>
                            <div className='text-center'>
                              <p className='text-blue-600 dark:text-blue-400 font-semibold text-lg animate-pulse'>
                                🎉 Start now and watch the magic happen! 🎉
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : achievements.length < achievementBadges.length ? (
                        <div className='text-center py-6 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-2xl border-2 border-green-300 dark:border-green-600 relative overflow-hidden'>
                          {/* Celebration elements */}
                          <div
                            className='absolute top-2 left-2 text-2xl animate-bounce'
                            style={{ animationDelay: '0s' }}
                          >
                            🎉
                          </div>
                          <div
                            className='absolute top-2 right-2 text-2xl animate-bounce'
                            style={{ animationDelay: '0.3s' }}
                          >
                            ⭐
                          </div>
                          <div
                            className='absolute bottom-2 left-4 text-2xl animate-bounce'
                            style={{ animationDelay: '0.6s' }}
                          >
                            🏆
                          </div>
                          <div
                            className='absolute bottom-2 right-4 text-2xl animate-bounce'
                            style={{ animationDelay: '0.9s' }}
                          >
                            🌟
                          </div>

                          <div className='relative z-10'>
                            <div className='flex items-center justify-center mb-4'>
                              <Trophy className='h-8 w-8 text-amber-500 mr-3 animate-bounce' />
                              <span className='text-2xl font-bold text-green-900 dark:text-green-100'>
                                You're Absolutely Amazing! 🎉
                              </span>
                            </div>
                            <p className='text-green-700 dark:text-green-300 text-lg font-medium mb-4'>
                              Look at you go! You've earned{' '}
                              {achievements.length} awesome badge
                              {achievements.length !== 1 ? 's' : ''}!
                            </p>
                            <div className='bg-gradient-to-r from-yellow-200 to-amber-200 dark:from-yellow-900/50 dark:to-amber-900/50 px-6 py-3 rounded-full inline-block border border-yellow-300 dark:border-yellow-600'>
                              <span className='text-yellow-800 dark:text-yellow-200 font-bold'>
                                🚀 Keep going to unlock{' '}
                                {achievementBadges.length - achievements.length}{' '}
                                more badges! 🚀
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className='text-center py-8 bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100 dark:from-yellow-900/30 dark:via-amber-900/30 dark:to-orange-900/30 rounded-2xl border-2 border-yellow-300 dark:border-yellow-600 relative overflow-hidden'>
                          {/* Ultimate celebration */}
                          <div className='absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-orange-200/20 animate-pulse'></div>
                          <div
                            className='absolute top-4 left-4 text-3xl animate-bounce'
                            style={{ animationDelay: '0s' }}
                          >
                            🎊
                          </div>
                          <div
                            className='absolute top-4 right-4 text-3xl animate-bounce'
                            style={{ animationDelay: '0.2s' }}
                          >
                            🏆
                          </div>
                          <div
                            className='absolute bottom-4 left-4 text-3xl animate-bounce'
                            style={{ animationDelay: '0.4s' }}
                          >
                            ⭐
                          </div>
                          <div
                            className='absolute bottom-4 right-4 text-3xl animate-bounce'
                            style={{ animationDelay: '0.6s' }}
                          >
                            🎉
                          </div>

                          <div className='relative z-10'>
                            <div className='text-6xl mb-4 animate-bounce'>
                              👑
                            </div>
                            <h3 className='text-3xl font-bold text-amber-900 dark:text-amber-100 mb-4'>
                              ULTIMATE BADGE MASTER! 🏆
                            </h3>
                            <p className='text-amber-700 dark:text-amber-300 text-xl font-bold mb-4'>
                              WOW! You've collected ALL the badges! You're
                              officially a Savings Superhero! 🦸‍♂️
                            </p>
                            <div className='bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full inline-block shadow-xl animate-pulse'>
                              <span className='text-lg font-bold'>
                                🌟 LEGENDARY STATUS ACHIEVED! 🌟
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Super Enhanced View All Badges Button */}
                      <Button
                        className='w-full mt-6 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-105 py-4 text-lg font-bold relative overflow-hidden'
                        onClick={handleShowAchievements}
                      >
                        {/* Animated background shimmer */}
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse'></div>

                        <div className='relative z-10 flex items-center justify-center'>
                          <Award className='mr-3 h-5 w-5 animate-pulse-lightning' />
                          🏆 View All My Amazing Badges! 🏆
                          <Award className='ml-3 h-5 w-5 animate-pulse-lightning' />
                        </div>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='savings' className='space-y-6 px-2 lg:px-4'>
              <Tabs value={savingsTab} onValueChange={setSavingsTab}>
                <TabsList className='grid grid-cols-4 mb-6 max-w-md mx-auto lg:max-w-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/40 shadow-lg'>
                  <TabsTrigger
                    value='auto'
                    className='text-xs lg:text-sm font-medium'
                  >
                    Auto Plans
                  </TabsTrigger>
                  <TabsTrigger
                    value='goals'
                    className='text-xs lg:text-sm font-medium'
                  >
                    Goals
                  </TabsTrigger>
                  <TabsTrigger
                    value='history'
                    className='text-xs lg:text-sm font-medium'
                  >
                    History
                  </TabsTrigger>
                  <TabsTrigger
                    value='summary'
                    className='text-xs lg:text-sm font-medium'
                  >
                    Summary
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='auto'>
                  <SavingsPlans
                    childId={
                      childData?.id || (user?.role === 'child' ? user.id : null)
                    }
                  />
                </TabsContent>

                <TabsContent value='goals'>
                  <Card>
                    <CardHeader
                      className='pb-2 cursor-pointer'
                      onClick={() => setIsGoalsExpanded(!isGoalsExpanded)}
                    >
                      <div className='flex justify-between items-center'>
                        <div className='flex flex-col'>
                          <CardTitle className='text-lg flex items-center'>
                            <Star className='h-5 w-5 mr-2 text-amber-500' />
                            My Savings Goals ({goals.length})
                            {isGoalsExpanded ? (
                              <ChevronUp className='h-4 w-4 ml-2' />
                            ) : (
                              <ChevronDown className='h-4 w-4 ml-2' />
                            )}
                          </CardTitle>
                          {!isGoalsExpanded && (
                            <p className='text-sm text-muted-foreground mt-1'>
                              Click to view goals
                            </p>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRefreshGoals();
                            }}
                            disabled={isLoadingGoals}
                            className='h-8 w-8 p-0'
                            title='Refresh goals'
                          >
                            <RefreshCcw
                              className={`h-4 w-4 ${
                                isLoadingGoals ? 'animate-spin' : ''
                              }`}
                            />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddGoal(true);
                            }}
                            className='h-8 px-3'
                          >
                            <Plus className='h-4 w-4 mr-1' />
                            New Goal
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {isGoalsExpanded && (
                      <CardContent className='p-4'>
                        {isLoadingGoals ? (
                          <div className='text-center py-8'>
                            <div className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2'></div>
                            <p className='text-sm text-muted-foreground'>
                              Loading goals...
                            </p>
                          </div>
                        ) : goals.length > 0 ? (
                          <div className='space-y-4'>
                            {goals.map((goal) => (
                              <div
                                key={goal.id}
                                className='border rounded-lg p-3 hover:bg-accent/50 transition-colors'
                              >
                                <div className='flex justify-between items-start'>
                                  <div className='flex-1'>
                                    <h3 className='font-medium'>{goal.name}</h3>
                                    <div className='flex justify-between text-xs text-muted-foreground mt-1 mb-1'>
                                      <span>
                                        {goal.current} / {goal.target} sats
                                      </span>
                                      <span>
                                        {Math.round(
                                          (goal.current / goal.target) * 100
                                        )}
                                        %
                                      </span>
                                    </div>
                                    <Progress
                                      value={(goal.current / goal.target) * 100}
                                      className='h-2 mb-2'
                                    />

                                    <div className='flex items-center justify-between mt-2'>
                                      <div className='flex items-center gap-2'>
                                        <Badge
                                          variant={
                                            goal.status === 'approved'
                                              ? 'default'
                                              : goal.status === 'completed'
                                              ? 'secondary'
                                              : 'outline'
                                          }
                                          className={`text-xs ${
                                            goal.status === 'completed'
                                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                              : ''
                                          }`}
                                        >
                                          {goal.status === 'approved'
                                            ? 'Active'
                                            : goal.status === 'completed'
                                            ? 'Completed'
                                            : 'Pending Approval'}
                                        </Badge>

                                        {goal.deletionRequested && (
                                          <Badge
                                            variant='destructive'
                                            className='text-xs'
                                          >
                                            Deletion Pending
                                          </Badge>
                                        )}
                                      </div>

                                      {!goal.deletionRequested && (
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          onClick={() =>
                                            handleDeleteGoal(goal.id, goal.name)
                                          }
                                          className='text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-auto'
                                        >
                                          <Trash2 className='h-4 w-4' />
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  {goal.status === 'approved' &&
                                    !goal.deletionRequested && (
                                      <Button
                                        size='sm'
                                        onClick={() =>
                                          handleOpenContributeModal(goal)
                                        }
                                        className='bg-green-600 hover:bg-green-700 ml-2 px-3'
                                        disabled={balance === 0}
                                      >
                                        <Plus className='mr-1 h-3 w-3' />
                                        Add Sats
                                      </Button>
                                    )}

                                  {goal.deletionRequested && (
                                    <div className='ml-2 text-xs text-orange-600 dark:text-orange-400'>
                                      Deletion pending
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className='text-center py-8'>
                            <Star className='h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3' />
                            <p className='text-muted-foreground mb-2'>
                              You don't have any savings goals yet
                            </p>
                            <div className='flex justify-center'>
                              <Button
                                onClick={() => setShowAddGoal(true)}
                                className='px-6'
                              >
                                <Plus className='mr-1 h-4 w-4' />
                                Create Your First Goal
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value='history'>
                  <TransactionHistory
                    childId={
                      childData?.id || (user?.role === 'child' ? user.id : null)
                    }
                    onViewAll={handleShowHistory}
                  />
                </TabsContent>

                <TabsContent value='summary'>
                  <Card className='bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-glass hover:shadow-glass-lg transition-all duration-300'>
                    <CardHeader className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <CardTitle className='text-xl flex items-center'>
                            <PiggyBank className='h-6 w-6 mr-3 drop-shadow-sm' />
                            My Savings Summary
                          </CardTitle>
                          <p className='text-blue-100 text-sm mt-1'>
                            Track your savings progress and achievements
                          </p>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleRefreshSavingsSummary}
                          disabled={isLoadingBalance || isLoadingGoals}
                          className='text-white hover:bg-white/20 transition-colors duration-200'
                          title='Refresh savings data'
                        >
                          <RefreshCcw
                            className={`h-5 w-5 ${
                              isLoadingBalance || isLoadingGoals
                                ? 'animate-spin'
                                : ''
                            }`}
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className='p-6'>
                      <div className='space-y-6'>
                        {/* Enhanced Stats Grid */}
                        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'>
                          {/* Total Saved */}
                          <div className='bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-5 rounded-xl border border-blue-200/50 dark:border-blue-700/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'>
                            <div className='flex items-center justify-between mb-2'>
                              <Coins className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                              <div className='bg-blue-600 dark:bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>
                                Main
                              </div>
                            </div>
                            <h3 className='text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1'>
                              Total Saved
                            </h3>
                            <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                              {totalSaved.toLocaleString()}
                            </p>
                            <p className='text-xs text-blue-600 dark:text-blue-400 mt-1'>
                              sats in your jar
                            </p>
                          </div>

                          {/* Active Goals */}
                          <div className='bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 p-5 rounded-xl border border-green-200/50 dark:border-green-700/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'>
                            <div className='flex items-center justify-between mb-2'>
                              <Target className='h-8 w-8 text-green-600 dark:text-green-400' />
                              <div className='bg-green-600 dark:bg-green-500 text-white text-xs px-2 py-1 rounded-full'>
                                Active
                              </div>
                            </div>
                            <h3 className='text-sm font-semibold text-green-700 dark:text-green-300 mb-1'>
                              Active Goals
                            </h3>
                            <p className='text-2xl font-bold text-green-900 dark:text-green-100'>
                              {approvedGoalsCount}
                            </p>
                            <p className='text-xs text-green-600 dark:text-green-400 mt-1'>
                              goals in progress
                            </p>
                          </div>

                          {/* Completed Goals */}
                          <div className='bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-800/30 p-5 rounded-xl border border-amber-200/50 dark:border-amber-700/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'>
                            <div className='flex items-center justify-between mb-2'>
                              <Trophy className='h-8 w-8 text-amber-600 dark:text-amber-400' />
                              <div className='bg-amber-600 dark:bg-amber-500 text-white text-xs px-2 py-1 rounded-full'>
                                Done
                              </div>
                            </div>
                            <h3 className='text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1'>
                              Completed Goals
                            </h3>
                            <p className='text-2xl font-bold text-amber-900 dark:text-amber-100'>
                              {completedGoalsCount}
                            </p>
                            <p className='text-xs text-amber-600 dark:text-amber-400 mt-1'>
                              goals achieved
                            </p>
                          </div>

                          {/* Pending Goals */}
                          <div className='bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 p-5 rounded-xl border border-purple-200/50 dark:border-purple-700/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'>
                            <div className='flex items-center justify-between mb-2'>
                              <Clock className='h-8 w-8 text-purple-600 dark:text-purple-400' />
                              <div className='bg-purple-600 dark:bg-purple-500 text-white text-xs px-2 py-1 rounded-full'>
                                Wait
                              </div>
                            </div>
                            <h3 className='text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1'>
                              Pending Goals
                            </h3>
                            <p className='text-2xl font-bold text-purple-900 dark:text-purple-100'>
                              {pendingGoalsCount}
                            </p>
                            <p className='text-xs text-purple-600 dark:text-purple-400 mt-1'>
                              awaiting approval
                            </p>
                          </div>
                        </div>

                        {/* Enhanced Goal Progress Section */}
                        {goals.length > 0 ? (
                          <div className='bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-700/50 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/30'>
                            <div className='flex items-center justify-between mb-4'>
                              <h3 className='text-lg font-semibold flex items-center'>
                                <TrendingUp className='h-5 w-5 mr-2 text-blue-600 dark:text-blue-400' />
                                Goal Progress Overview
                              </h3>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setSavingsTab('goals')}
                                className='text-xs'
                              >
                                Manage Goals
                              </Button>
                            </div>
                            <div className='space-y-4'>
                              {goals.map((goal) => {
                                const progress =
                                  (goal.current / goal.target) * 100;
                                const remaining = goal.target - goal.current;
                                return (
                                  <div
                                    key={goal.id}
                                    className='bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/30 shadow-sm'
                                  >
                                    <div className='flex justify-between items-start mb-3'>
                                      <div>
                                        <h4 className='font-medium text-gray-900 dark:text-gray-100'>
                                          {goal.name}
                                        </h4>
                                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                                          {goal.current.toLocaleString()} /{' '}
                                          {goal.target.toLocaleString()} sats
                                        </p>
                                      </div>
                                      <div className='text-right'>
                                        <div className='text-lg font-bold text-blue-600 dark:text-blue-400'>
                                          {Math.round(progress)}%
                                        </div>
                                        <div className='text-xs text-gray-500 dark:text-gray-400'>
                                          {remaining.toLocaleString()} left
                                        </div>
                                      </div>
                                    </div>
                                    <Progress
                                      value={progress}
                                      className='h-3 bg-gray-200 dark:bg-gray-700'
                                    />
                                    <div className='flex justify-between items-center mt-2'>
                                      <span
                                        className={`text-xs px-2 py-1 rounded-full ${
                                          goal.status === 'approved'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : goal.status === 'completed'
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                        }`}
                                      >
                                        {goal.status === 'approved'
                                          ? 'Active'
                                          : goal.status === 'completed'
                                          ? 'Completed'
                                          : 'Pending'}
                                      </span>
                                      {goal.status === 'approved' && (
                                        <Button
                                          variant='outline'
                                          size='sm'
                                          onClick={() =>
                                            handleOpenContributeModal(goal)
                                          }
                                          className='text-xs h-7'
                                        >
                                          <Plus className='h-3 w-3 mr-1' />
                                          Add Sats
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-xl border border-blue-200/50 dark:border-blue-700/30 text-center'>
                            <Target className='h-12 w-12 mx-auto mb-4 text-blue-500 dark:text-blue-400' />
                            <h3 className='text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2'>
                              Start Your Savings Journey!
                            </h3>
                            <p className='text-blue-700 dark:text-blue-300 mb-4'>
                              Create your first savings goal and watch your
                              money grow
                            </p>
                            <Button
                              onClick={() => {
                                setSavingsTab('goals');
                                setShowAddGoal(true);
                              }}
                              className='bg-blue-600 hover:bg-blue-700 text-white'
                            >
                              <Star className='h-4 w-4 mr-2' />
                              Create Your First Goal
                            </Button>
                          </div>
                        )}

                        {/* Savings Insights Card */}
                        <div className='bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-200/50 dark:border-amber-700/30'>
                          <div className='flex items-center mb-4'>
                            <div className='bg-amber-500 p-2 rounded-lg mr-3'>
                              <Award className='h-5 w-5 text-white' />
                            </div>
                            <div>
                              <h3 className='font-semibold text-amber-900 dark:text-amber-100'>
                                Savings Insights
                              </h3>
                              <p className='text-sm text-amber-700 dark:text-amber-300'>
                                Your savings journey at a glance
                              </p>
                            </div>
                          </div>
                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div className='bg-white/70 dark:bg-slate-800/70 p-4 rounded-lg'>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-amber-800 dark:text-amber-200'>
                                  Savings Rate
                                </span>
                                <TrendingUp className='h-4 w-4 text-green-600 dark:text-green-400' />
                              </div>
                              <p className='text-lg font-bold text-amber-900 dark:text-amber-100'>
                                {goals.length > 0 ? 'Great!' : 'Get Started'}
                              </p>
                              <p className='text-xs text-amber-700 dark:text-amber-300'>
                                {goals.length > 0
                                  ? `${approvedGoalsCount} active goals`
                                  : 'Create your first goal'}
                              </p>
                            </div>
                            <div className='bg-white/70 dark:bg-slate-800/70 p-4 rounded-lg'>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-amber-800 dark:text-amber-200'>
                                  Achievement Level
                                </span>
                                <Trophy className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                              </div>
                              <p className='text-lg font-bold text-amber-900 dark:text-amber-100'>
                                {completedGoalsCount > 0
                                  ? 'Champion'
                                  : 'Beginner'}
                              </p>
                              <p className='text-xs text-amber-700 dark:text-amber-300'>
                                {completedGoalsCount} goals completed
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>

          {/* Add the AddFundsModal component */}
          <AddFundsModal
            open={showAddFundsModal}
            onOpenChange={setShowAddFundsModal}
            childId={childData?.id || (user?.role === 'child' ? user.id : null)}
            childName={childData?.name || user?.name}
            onSuccess={() => {
              // Refresh balance after successful payment
              handleRefreshBalance();
            }}
          />

          {/* Goal Creation Modal */}
          <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Create New Savings Goal</DialogTitle>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='goal-name' className='text-right'>
                    Name
                  </Label>
                  <Input
                    id='goal-name'
                    value={newGoalData.name}
                    onChange={(e) =>
                      setNewGoalData({ ...newGoalData, name: e.target.value })
                    }
                    className='col-span-3'
                    placeholder='e.g., New Bicycle'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='goal-target' className='text-right'>
                    Target (sats)
                  </Label>
                  <Input
                    id='goal-target'
                    type='number'
                    value={newGoalData.target}
                    onChange={(e) =>
                      setNewGoalData({
                        ...newGoalData,
                        target: parseInt(e.target.value) || 0,
                      })
                    }
                    className='col-span-3'
                    placeholder='1000'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='goal-description' className='text-right'>
                    Description
                  </Label>
                  <Textarea
                    id='goal-description'
                    value={newGoalData.description}
                    onChange={(e) =>
                      setNewGoalData({
                        ...newGoalData,
                        description: e.target.value,
                      })
                    }
                    className='col-span-3'
                    placeholder='Why do you want to save for this?'
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant='outline' onClick={() => setShowAddGoal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGoal}>Create Goal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Goal Contribution Modal */}
          <Dialog
            open={showContributeModal}
            onOpenChange={setShowContributeModal}
          >
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Contribute to Goal</DialogTitle>
                <p className='text-sm text-muted-foreground'>
                  Add sats to "{selectedGoal?.name}"
                </p>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                {/* Goal Progress */}
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Current Progress</span>
                    <span>
                      {selectedGoal?.current || 0} / {selectedGoal?.target || 0}{' '}
                      sats
                    </span>
                  </div>
                  <Progress
                    value={
                      selectedGoal
                        ? (selectedGoal.current / selectedGoal.target) * 100
                        : 0
                    }
                    className='h-2'
                  />
                  <div className='text-center text-xs text-muted-foreground'>
                    {selectedGoal
                      ? Math.round(
                          (selectedGoal.current / selectedGoal.target) * 100
                        )
                      : 0}
                    % complete
                  </div>
                </div>

                {/* Balance Info */}
                <div className='bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>Your Balance</span>
                    <span className='text-lg font-bold text-blue-600 dark:text-blue-400'>
                      {balance} sats
                    </span>
                  </div>
                </div>

                {/* Contribution Amount */}
                <div className='space-y-2'>
                  <Label htmlFor='contribution-amount'>
                    Contribution Amount (sats)
                  </Label>
                  <Input
                    id='contribution-amount'
                    type='number'
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder='Enter amount to contribute'
                    min='1'
                    max={balance}
                  />
                  <div className='flex gap-2 mt-2'>
                    {[10, 25, 50, 100].map((amount) => (
                      <Button
                        key={amount}
                        variant='outline'
                        size='sm'
                        onClick={() => setContributionAmount(amount.toString())}
                        disabled={amount > balance}
                        className='flex-1'
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setContributionAmount(balance.toString())}
                    disabled={balance === 0}
                    className='w-full'
                  >
                    All ({balance} sats)
                  </Button>
                </div>

                {/* Preview */}
                {contributionAmount && parseInt(contributionAmount) > 0 && (
                  <div className='bg-green-50 dark:bg-green-900/20 p-3 rounded-lg'>
                    <div className='text-sm space-y-1'>
                      <div className='flex justify-between'>
                        <span>After contribution:</span>
                        <span className='font-medium'>
                          {(selectedGoal?.current || 0) +
                            parseInt(contributionAmount)}{' '}
                          / {selectedGoal?.target || 0} sats
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Remaining balance:</span>
                        <span className='font-medium'>
                          {balance - parseInt(contributionAmount)} sats
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Progress:</span>
                        <span className='font-medium text-green-600 dark:text-green-400'>
                          {selectedGoal
                            ? Math.round(
                                ((selectedGoal.current +
                                  parseInt(contributionAmount)) /
                                  selectedGoal.target) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setShowContributeModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleContributeToGoal}
                  disabled={
                    !contributionAmount ||
                    parseInt(contributionAmount) <= 0 ||
                    parseInt(contributionAmount) > balance
                  }
                  className='bg-green-600 hover:bg-green-700'
                >
                  <Plus className='mr-1 h-4 w-4' />
                  Contribute {contributionAmount} sats
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Bottom Navigation for Child - Mobile Only */}
          {!hideBottomNav && (
            <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t py-2 px-4 z-10'>
              <div className='flex justify-around max-w-md mx-auto'>
                <Button
                  variant='ghost'
                  className='flex flex-col items-center h-auto py-1'
                  onClick={() => setActiveTab('home')}
                >
                  <Home
                    className={`h-5 w-5 ${
                      activeTab === 'home'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      activeTab === 'home'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Home
                  </span>
                </Button>

                <Button
                  variant='ghost'
                  className='flex flex-col items-center h-auto py-1'
                  onClick={() => setActiveTab('savings')}
                >
                  <Coins
                    className={`h-5 w-5 ${
                      activeTab === 'savings'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      activeTab === 'savings'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Savings
                  </span>
                </Button>

                <Button
                  variant='ghost'
                  className='flex flex-col items-center h-auto py-1'
                  onClick={onLogout}
                >
                  <LogOut className='h-5 w-5 text-muted-foreground' />
                  <span className='text-xs text-muted-foreground'>Logout</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DesktopContentLayout>
    </ResponsiveLayout>
  );
};

export default ChildDashboard;
