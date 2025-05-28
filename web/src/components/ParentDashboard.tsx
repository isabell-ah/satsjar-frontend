import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RefreshCcw,
  User,
  Star,
  Book,
  Award,
  History,
  ChevronRight,
  Settings,
  Info,
  Users,
  Coins,
  Plus,
  ChevronUp,
  ChevronDown,
  Gift,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock as ClockIcon,
  Trophy,
  Trash2,
  Home,
  LogOut,
  Target,
  Clock,
  PiggyBank,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { useAuth } from '@/contexts/UserAuthContext';
import { useNavigate } from 'react-router-dom';
import ManageChildren from './ManageChildren';
import AddFundsModal from './AddFundsModal';
import SavingsPlans from './SavingsPlans';
import {
  childrenApi,
  transactionsApi,
  goalsApi,
  achievementsApi,
  // activitiesApi
} from '@/services/api';
import { Link } from 'react-router-dom';
import ResponsiveLayout from './ResponsiveLayout';
import {
  DesktopContentLayout,
  DesktopButtonGroup,
  DesktopProgressBar,
} from './DesktopContentLayout';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Define types for our data
interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  status: 'approved' | 'pending' | 'completed';
  createdAt?: string;
  deletionRequested?: boolean;
  deletionRequestedAt?: string;
}

interface Child {
  id: string;
  jarId: string;
  name: string;
  balance: number;
  goals: Goal[];
}

interface Transaction {
  id: string;
  childName: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  description?: string;
}

interface Activity {
  id: string;
  type: string;
  childName: string; // Keep for backend compatibility
  childJarId: string; // Use for display
  childId: string;
  date: string;
  amount?: number;
  goalName?: string;
  lessonName?: string;
  score?: number;
  description?: string;
}

// Sample data for fallback when API fails
// const sampleChildren: Child[] = [
//   { id: '1', jarId: 'JR1234', name: 'Alice', balance: 1000, goals: [] },
//   { id: '2', jarId: 'JR5678', name: 'Bob', balance: 500, goals: [] },
// ];
// const sampleTransactions: Transaction[] = [];
// const sampleSavingsData: any[] = [];

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [childrenData, setChildrenData] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [savingsTab, setSavingsTab] = useState('summary');
  const [timeframe, setTimeframe] = useState('month');
  const [showManageChildren, setShowManageChildren] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [childSavingsData, setChildSavingsData] = useState<any[]>([]);
  const [fundChildModal, setFundChildModal] = useState({
    open: false,
    childId: '',
    childName: '',
  });
  const [isActivitiesExpanded, setIsActivitiesExpanded] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [parentMetrics, setParentMetrics] = useState({
    totalSaved: 0,
    totalGoals: 0,
    completedGoals: 0,
    averageSavingsRate: 0,
    learningProgress: 0,
    activeChildren: 0,
    approvedGoals: 0,
    pendingGoals: 0,
    averageGoalProgress: 0,
  });
  const [currentlyLoggedInChild, setCurrentlyLoggedInChild] =
    useState<Child | null>(null);
  const [isJarsExpanded, setIsJarsExpanded] = useState(false);
  // Add a state to track server connection status
  const [serverStatus, setServerStatus] = useState<
    'connecting' | 'connected' | 'error'
  >('connecting');
  // Add state for achievements
  const [childrenAchievements, setChildrenAchievements] = useState<{
    [childId: string]: any[];
  }>({});
  // Add state for approved goals expansion
  const [isApprovedGoalsExpanded, setIsApprovedGoalsExpanded] = useState(false);
  // Add state for completed goals expansion
  const [isCompletedGoalsExpanded, setIsCompletedGoalsExpanded] =
    useState(false);

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString()} sats`;
  };

  // Helper function to get pending goals count (includes creation and deletion approvals)
  const getPendingGoalsCount = () => {
    return childrenData.reduce(
      (count, child) =>
        count +
        child.goals.filter(
          (goal) => goal.status === 'pending' || goal.deletionRequested
        ).length,
      0
    );
  };

  // Helper function to get a readable label for activity types
  const getActivityTypeLabel = (type: string): string => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'goal_created':
        return 'Goal Created';
      case 'goal_completed':
        return 'Goal Completed';
      case 'quiz_completed':
        return 'Quiz Completed';
      case 'lesson_completed':
        return 'Lesson Completed';
      case 'achievement_unlocked':
        return 'Achievement Unlocked';
      default:
        return type
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  // Function to handle viewing all activities
  const handleViewAllActivities = () => {
    toast({
      title: 'View All Activities',
      description: 'Navigating to detailed activities view',
    });
    // navigate('/activities'); // Uncomment when the route is available
  };

  // Calculate accurate family metrics when childrenData changes
  useEffect(() => {
    if (childrenData.length > 0) {
      // Total family savings across all children
      const totalSaved = childrenData.reduce(
        (sum, child) => sum + child.balance,
        0
      );

      // Goal statistics
      let totalGoals = 0;
      let completedGoals = 0;
      let approvedGoals = 0;
      let pendingGoals = 0;
      let totalGoalProgress = 0;

      childrenData.forEach((child) => {
        if (child.goals && child.goals.length > 0) {
          totalGoals += child.goals.length;
          child.goals.forEach((goal) => {
            // Check if goal is pending creation approval
            const isPendingCreation = goal.status === 'pending';

            // Check if goal is pending deletion approval
            const isPendingDeletion = goal.deletionRequested === true;

            if (goal.status === 'completed') {
              completedGoals++;
              totalGoalProgress += 100;
            } else if (goal.status === 'approved' && !isPendingDeletion) {
              // Only count as approved if not pending deletion
              approvedGoals++;
              const progress =
                goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
              totalGoalProgress += progress;
            }

            // Count pending goals (creation OR deletion)
            if (isPendingCreation || isPendingDeletion) {
              pendingGoals++;
            }
          });
        }
      });

      // Calculate average goal progress across all goals
      const averageGoalProgress =
        totalGoals > 0 ? totalGoalProgress / totalGoals : 0;

      // Calculate average daily savings rate based on recent activity
      // This is a simplified calculation - in a real app you'd track historical data
      const averageSavingsRate = totalSaved / (childrenData.length * 30);

      // Active children (those with balance > 0 or active goals)
      const activeChildren = childrenData.filter(
        (child) => child.balance > 0 || (child.goals && child.goals.length > 0)
      ).length;

      // Calculate learning progress based on completed goals and activities
      // This is a simplified metric - in a real app you'd track actual learning modules
      const learningProgress = Math.min(
        100,
        completedGoals * 20 + approvedGoals * 10
      );

      console.log('ParentDashboard: Calculating metrics:', {
        totalGoals,
        pendingGoals,
        approvedGoals,
        completedGoals,
        childrenData: childrenData.map((child) => ({
          name: child.name,
          goals: child.goals.map((goal) => ({
            name: goal.name,
            status: goal.status,
            deletionRequested: goal.deletionRequested,
            isPendingCreation: goal.status === 'pending',
            isPendingDeletion: goal.deletionRequested === true,
            countedAs:
              goal.status === 'pending' || goal.deletionRequested === true
                ? 'PENDING'
                : goal.status === 'completed'
                ? 'COMPLETED'
                : goal.status === 'approved' && !goal.deletionRequested
                ? 'APPROVED'
                : 'OTHER',
          })),
        })),
      });

      console.log('🎯 EXPECTED: Dashboard should show 3 pending goals');
      console.log('📊 ACTUAL: pendingGoals =', pendingGoals);

      setParentMetrics({
        totalSaved,
        totalGoals,
        completedGoals,
        averageSavingsRate,
        learningProgress,
        activeChildren,
        approvedGoals,
        pendingGoals,
        averageGoalProgress,
      });
    } else {
      // Reset metrics when no children
      setParentMetrics({
        totalSaved: 0,
        totalGoals: 0,
        completedGoals: 0,
        averageSavingsRate: 0,
        learningProgress: 0,
        activeChildren: 0,
        approvedGoals: 0,
        pendingGoals: 0,
        averageGoalProgress: 0,
      });
    }
  }, [childrenData]);

  // Detect the currently logged-in child (if any) or fall back to most active
  useEffect(() => {
    console.log('🔄 ParentDashboard: Running child selection logic...');
    console.log(
      '📊 Available children:',
      childrenData.map((c) => ({ id: c.id, name: c.name }))
    );

    if (childrenData.length > 0) {
      // First, try to detect if there's a currently logged-in child
      // Check if any child has recent login activity or is marked as active
      let currentlyActiveChild = null;

      // Check localStorage for recently active child (with timeout)
      const recentlyActiveChildId = localStorage.getItem(
        'recentlyActiveChildId'
      );
      const recentlyActiveTimestamp = localStorage.getItem(
        'recentlyActiveChildTimestamp'
      );

      console.log('🔍 Checking localStorage for recently active child...');
      console.log('  - recentlyActiveChildId:', recentlyActiveChildId);
      console.log('  - recentlyActiveTimestamp:', recentlyActiveTimestamp);

      if (recentlyActiveChildId && recentlyActiveTimestamp) {
        const timeSinceActive = Date.now() - parseInt(recentlyActiveTimestamp);
        const timeoutMinutes = 30; // Clear after 30 minutes

        console.log(
          '  - Time since active:',
          Math.round(timeSinceActive / 1000 / 60),
          'minutes'
        );
        console.log(
          '  - Is expired:',
          timeSinceActive >= timeoutMinutes * 60 * 1000
        );

        if (timeSinceActive < timeoutMinutes * 60 * 1000) {
          currentlyActiveChild = childrenData.find(
            (child) => child.id === recentlyActiveChildId
          );
          console.log(
            '✅ Found recently active child:',
            currentlyActiveChild?.name
          );
          console.log('  - Matched child ID:', currentlyActiveChild?.id);
          console.log('  - Looking for ID:', recentlyActiveChildId);
        } else {
          // Clear expired data
          localStorage.removeItem('recentlyActiveChildId');
          localStorage.removeItem('recentlyActiveChildTimestamp');
          console.log(
            '⏰ Recently active child data expired, cleared from localStorage'
          );
        }
      } else {
        console.log('❌ No recently active child data found in localStorage');
      }

      // If no recently active child found, fall back to most active child algorithm
      if (!currentlyActiveChild) {
        console.log(
          'No recently active child found, using activity score algorithm'
        );
        let mostActiveChild = childrenData[0]; // Default to first child
        let highestActivityScore = 0;

        childrenData.forEach((child) => {
          let activityScore = 0;

          // Score based on balance (higher balance = more active)
          activityScore += child.balance * 0.1;

          // Score based on goals
          if (child.goals && child.goals.length > 0) {
            activityScore += child.goals.length * 10; // 10 points per goal

            // Bonus for approved goals
            const approvedGoals = child.goals.filter(
              (goal) => goal.status === 'approved'
            ).length;
            activityScore += approvedGoals * 15;

            // Bonus for completed goals
            const completedGoals = child.goals.filter(
              (goal) => goal.status === 'completed'
            ).length;
            activityScore += completedGoals * 25;

            // Bonus for goal progress
            child.goals.forEach((goal) => {
              if (goal.target > 0) {
                const progress = (goal.current / goal.target) * 100;
                activityScore += progress * 0.5; // 0.5 points per percent progress
              }
            });
          }

          // If this child has a higher activity score, they become the most active
          if (activityScore > highestActivityScore) {
            highestActivityScore = activityScore;
            mostActiveChild = child;
          }
        });

        currentlyActiveChild = mostActiveChild;
        console.log(
          'Selected most active child by score:',
          currentlyActiveChild?.name
        );
      }

      setCurrentlyLoggedInChild(currentlyActiveChild);
    } else {
      setCurrentlyLoggedInChild(null);
    }
  }, [childrenData]);

  // Generate sample activities data
  useEffect(() => {
    if (childrenData.length > 0) {
      const transactionActivities = recentTransactions.map((tx) => {
        // Find child by name to get jarId
        const child = childrenData.find((c) => c.name === tx.childName);
        return {
          id: tx.id,
          type: tx.type,
          childName: tx.childName, // Keep for backend compatibility
          childJarId: child?.jarId || 'Unknown', // Use jarId for display
          childId: child?.id || '',
          date: tx.date,
          amount: tx.amount,
          description: tx.description,
        };
      });

      const additionalActivities: Activity[] = [];
      childrenData.forEach((child) => {
        if (child.goals && child.goals.length > 0) {
          child.goals.forEach((goal) => {
            // Use actual goal creation date if available, otherwise use recent date
            const goalCreatedDate = goal.createdAt
              ? new Date(goal.createdAt).toISOString()
              : new Date(
                  Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
                ).toISOString();

            additionalActivities.push({
              id: `goal-created-${goal.id}`,
              type: 'goal_created',
              childName: child.name, // Keep for backend compatibility
              childJarId: child.jarId || 'Unknown', // Use jarId for display
              childId: child.id,
              date: goalCreatedDate,
              goalName: goal.name,
            });
            if (
              goal.current / goal.target > 0.75 &&
              goal.current / goal.target < 1
            ) {
              additionalActivities.push({
                id: `goal-progress-${goal.id}`,
                type: 'goal_progress',
                childName: child.name, // Keep for backend compatibility
                childJarId: child.jarId || 'Unknown', // Use jarId for display
                childId: child.id,
                date: new Date(
                  Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000
                ).toISOString(),
                goalName: goal.name,
                description: `${Math.round(
                  (goal.current / goal.target) * 100
                )}% complete`,
              });
            }
          });
        }
      });

      const lessonNames = [
        'Introduction to Saving',
        'What is Bitcoin?',
        'Setting Financial Goals',
        'The Value of Money',
      ];

      childrenData.forEach((child) => {
        const numActivities = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numActivities; i++) {
          const isQuiz = Math.random() > 0.5;
          additionalActivities.push({
            id: `learning-${child.id}-${i}`,
            type: isQuiz ? 'quiz_completed' : 'lesson_completed',
            childName: child.name, // Keep for backend compatibility
            childJarId: child.jarId || 'Unknown', // Use jarId for display
            childId: child.id,
            date: new Date(
              Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
            lessonName:
              lessonNames[Math.floor(Math.random() * lessonNames.length)],
            score: isQuiz ? Math.floor(70 + Math.random() * 31) : undefined,
          });
        }
      });

      const allActivities = [...transactionActivities, ...additionalActivities]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
      setRecentActivities(allActivities);
    }
  }, [childrenData, recentTransactions]);

  // Filter activities based on the selected filter
  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') {
      return recentActivities;
    }
    if (activityFilter === 'transactions') {
      return recentActivities.filter(
        (activity) =>
          activity.type === 'deposit' || activity.type === 'withdrawal'
      );
    }
    if (activityFilter === 'goals') {
      return recentActivities.filter((activity) =>
        activity.type.includes('goal')
      );
    }
    if (activityFilter === 'learning') {
      return recentActivities.filter(
        (activity) =>
          activity.type.includes('quiz') || activity.type.includes('lesson')
      );
    }
    return recentActivities;
  }, [recentActivities, activityFilter]);

  // Function to handle viewing a child's dashboard
  const handleViewChildDashboard = (childId: string) => {
    const child = childrenData.find((c) => c.id === childId);
    if (child) {
      toast({
        title: 'Viewing Child Dashboard',
        description: `Switching to child's dashboard`,
      });
      navigate(`/child-dashboard/${childId}`, {
        state: { childData: child },
      });
    }
  };

  // Function to handle adding funds to a child
  const handleAddFunds = (childId: string) => {
    console.log(
      'ParentDashboard: handleAddFunds called with childId:',
      childId
    );
    const child = childrenData.find((c) => c.id === childId);
    if (child) {
      console.log('ParentDashboard: Found child:', child.name);
      setFundChildModal({
        open: true,
        childId: child.id,
        childName: child.name,
      });
    } else {
      console.error('ParentDashboard: Child not found for id:', childId);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not find child information',
      });
    }
  };

  // Revert to original fetchChildrenData function
  const fetchChildrenData = async () => {
    setIsLoadingData(true);
    setIsLoadingGoals(true);
    setServerStatus('connecting');

    try {
      console.log('📡 Fetching children list...');

      // Get the list of active children (not deleted)
      const childrenResponse = await childrenApi.getChildren();
      console.log('Children API response:', childrenResponse);

      setServerStatus('connected');

      // Filter out any children marked as deleted
      const activeChildren = (childrenResponse.children || []).filter(
        (child: any) => !child.deleted && !child.isDeleted
      );

      console.log(`📊 Found ${activeChildren.length} active children`);

      if (activeChildren.length === 0) {
        console.log('No active children found');
        setChildrenData([]);
        setRecentTransactions([]);
        setRecentActivities([]);
        setIsLoadingData(false);
        return;
      }

      // Get detailed information for each child
      const childrenWithDetails = await Promise.all(
        activeChildren.map(async (child: any) => {
          try {
            // Get detailed child information including balance
            const childDetails = await childrenApi.getChildDetails(child.id);

            if (childDetails.deleted || childDetails.isDeleted) {
              return null;
            }

            // Get goals properly - try child details first, then API if needed
            let childGoals = childDetails.goals || [];

            // If no goals in child details, try the goals API
            if (childGoals.length === 0) {
              try {
                if (typeof goalsApi.getSavingsGoals === 'function') {
                  const apiGoals = await goalsApi.getSavingsGoals(child.id);
                  if (apiGoals && apiGoals.length > 0) {
                    childGoals = apiGoals;
                  }
                }
              } catch (goalError) {
                console.error(
                  `Error fetching goals for ${child.name}:`,
                  goalError
                );
              }
            }

            // Goals loaded successfully

            const processedChild = {
              id: child.id,
              jarId: child.jarId || childDetails.jarId,
              name: child.name,
              balance: childDetails.balance || child.balance || 0,
              goals: (childGoals || []).map((goal: any) => ({
                id: goal.id,
                name: goal.name,
                target: goal.targetAmount || goal.target || 0,
                current: goal.currentAmount || goal.current || 0,
                createdAt: goal.createdAt, // Include creation timestamp
                deletionRequested: goal.deletionRequested || false, // Include deletion request status
                deletionRequestedAt: goal.deletionRequestedAt, // Include deletion request timestamp
                status:
                  goal.status ||
                  (goal.approved
                    ? goal.currentAmount >= goal.targetAmount
                      ? 'completed'
                      : 'approved'
                    : 'pending'),
              })),
            };

            console.log(
              `Processed child data for ${child.name}:`,
              processedChild
            );
            return processedChild;
          } catch (error) {
            console.error(
              `Error fetching details for child ${child.id}:`,
              error
            );
            // Return basic child data without goals
            return {
              id: child.id,
              jarId: child.jarId || '',
              name: child.name,
              balance: child.balance || 0,
              goals: [],
            };
          }
        })
      );

      // Filter out any null entries (deleted children)
      const validChildren = childrenWithDetails.filter(
        (child) => child !== null
      );
      setChildrenData(validChildren);

      // Cache the children data for faster subsequent loads
      try {
        const cacheData = {
          data: validChildren,
          timestamp: Date.now(),
          transactions: [], // Will be updated below
        };
        sessionStorage.setItem(
          'parent_children_data',
          JSON.stringify(cacheData)
        );
        console.log('📦 Cached children data for faster loading');
      } catch (cacheError) {
        console.warn('⚠️ Failed to cache children data:', cacheError);
      }

      // Fetch transactions - with better error handling and debugging
      try {
        let transactions = [];

        console.log('🔄 Fetching parent transactions...');

        // Try to get transactions from the API
        try {
          const transactionsResponse =
            await transactionsApi.getParentTransactions();

          console.log('📊 Raw transactions response:', transactionsResponse);

          if (
            transactionsResponse &&
            Array.isArray(transactionsResponse.transactions)
          ) {
            transactions = transactionsResponse.transactions;
            console.log(
              '✅ Found transactions in .transactions property:',
              transactions.length
            );
          } else if (Array.isArray(transactionsResponse)) {
            // Handle case where API returns array directly
            transactions = transactionsResponse;
            console.log(
              '✅ Found transactions as direct array:',
              transactions.length
            );
          } else if (transactionsResponse && transactionsResponse.data) {
            // Handle case where API returns data in .data property
            transactions = Array.isArray(transactionsResponse.data)
              ? transactionsResponse.data
              : transactionsResponse.data.transactions || [];
            console.log(
              '✅ Found transactions in .data property:',
              transactions.length
            );
          } else {
            console.log('⚠️ No transactions found in response');
          }

          // Skip individual child transaction fetching to improve performance
          // This reduces API calls significantly
          if (transactions.length === 0) {
            console.log(
              '📊 No parent transactions found, using empty array for faster loading'
            );
          }
        } catch (txError) {
          console.error('❌ Error fetching transactions:', txError);
          console.log('🔄 Attempting fallback transaction fetch...');

          // Fallback: try to get transactions using alternative methods
          try {
            // Try getting all transactions without parent filter
            const fallbackResponse = await transactionsApi.getTransactions?.();
            if (fallbackResponse && Array.isArray(fallbackResponse)) {
              transactions = fallbackResponse;
              console.log(
                '✅ Fallback transactions found:',
                transactions.length
              );
            }
          } catch (fallbackError) {
            console.error(
              '❌ Fallback transaction fetch failed:',
              fallbackError
            );
          }
        }

        // Set transactions (empty array if none found)
        setRecentTransactions(transactions);
        console.log(
          `📊 Final transactions set: ${transactions.length} transactions`
        );

        if (transactions.length > 0) {
          console.log('📋 Sample transaction:', transactions[0]);
        }

        // Update cache with transactions
        try {
          const cacheData = {
            data: validChildren,
            transactions: transactions,
            timestamp: Date.now(),
          };
          sessionStorage.setItem(
            'parent_children_data',
            JSON.stringify(cacheData)
          );
          console.log('📦 Updated cache with transactions data');
        } catch (cacheError) {
          console.warn(
            '⚠️ Failed to update cache with transactions:',
            cacheError
          );
        }
      } catch (error) {
        console.error('❌ Error in transactions block:', error);
        setRecentTransactions([]);
      }

      // Skip activities since there's no API for it
      setRecentActivities([]);

      console.log('✅ Parent dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching children data:', error);

      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load children data. Please try again.',
      });

      // Set empty arrays instead of sample data
      setChildrenData([]);
      setRecentTransactions([]);
      setRecentActivities([]);
      setServerStatus('error');
    } finally {
      setIsLoadingData(false);
      setIsLoadingGoals(false);
    }
  };

  // Fetch achievements for all children
  const fetchChildrenAchievements = async () => {
    try {
      if (childrenData.length === 0) return;

      console.log('Fetching achievements for all children...');
      const achievementsMap: { [childId: string]: any[] } = {};

      // Fetch achievements for each child
      await Promise.all(
        childrenData.map(async (child) => {
          try {
            console.log(
              `Fetching achievements for ${child.name} (${child.id})`
            );
            const response = await achievementsApi.getChildAchievements(
              child.id
            );
            achievementsMap[child.id] = response.achievements || [];
            console.log(
              `Achievements for ${child.name}:`,
              response.achievements
            );
          } catch (error) {
            console.error(
              `Error fetching achievements for child ${child.id}:`,
              error
            );
            achievementsMap[child.id] = [];
          }
        })
      );

      setChildrenAchievements(achievementsMap);
      console.log('All children achievements:', achievementsMap);
    } catch (error) {
      console.error('Error fetching children achievements:', error);
      setChildrenAchievements({});
    }
  };

  // Fetch data on component mount and clear any problematic cache
  useEffect(() => {
    // Clear any cached data that might be causing issues
    sessionStorage.removeItem('parent_children_data');
    fetchChildrenData();
  }, []);

  // Auto-retry goals loading if initial load shows 0 goals
  useEffect(() => {
    if (childrenData.length > 0) {
      const totalGoals = childrenData.reduce(
        (sum, child) => sum + (child.goals?.length || 0),
        0
      );

      if (totalGoals === 0 && !isLoadingData) {
        console.log('🔄 No goals found, retrying goals fetch in 2 seconds...');
        const retryTimer = setTimeout(() => {
          console.log('🔄 Retrying goals fetch...');
          fetchChildrenData();
        }, 2000);

        return () => clearTimeout(retryTimer);
      }
    }
  }, [childrenData, isLoadingData]);

  // Refresh data when returning from ManageChildren
  useEffect(() => {
    if (!showManageChildren) {
      fetchChildrenData();
    }
  }, [showManageChildren]);

  // Load achievements lazily after initial data loads (performance optimization)
  useEffect(() => {
    if (childrenData.length > 0 && !isLoadingData) {
      // Delay achievements loading to improve perceived performance
      const timer = setTimeout(() => {
        fetchChildrenAchievements();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [childrenData, isLoadingData]);

  // Fallback to sample data if API fails
  const useSampleData = () => {
    // Set empty arrays instead of sample data
    setChildrenData([]);
    setRecentTransactions([]);
    setChildSavingsData([]);
    setSelectedChild('');
  };

  // Optimized savings data generation - load charts lazily
  const generateSavingsData = async (
    children: Child[],
    transactions: Transaction[]
  ) => {
    if (children.length === 0) {
      setChildSavingsData([]);
      return;
    }

    // Use existing transaction data instead of making new API calls
    if (transactions.length > 0) {
      console.log('📊 Using existing transaction data for charts');

      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Get last 6 months including current month
      const relevantMonths = [];
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
        relevantMonths.push({
          name: months[monthIndex],
          index: monthIndex,
          year: year,
        });
      }

      // Initialize data structure
      const savingsData = relevantMonths.map((month) => {
        const data: any = {
          month: month.name,
          monthYear: `${month.name} ${month.year}`,
          monthIndex: month.index,
          year: month.year,
        };
        children.forEach((child) => {
          data[child.name] = 0;
          data[`${child.name}_cumulative`] = 0;
        });
        return data;
      });

      // Process existing transaction data without additional API calls
      children.forEach((child) => {
        const childTransactions = transactions.filter(
          (tx) => tx.childId === child.id || tx.childName === child.name
        );

        if (childTransactions.length > 0) {
          let cumulativeBalance = 0;
          const sortedTxs = childTransactions
            .filter((tx) => tx.type === 'deposit' && tx.amount > 0)
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );

          relevantMonths.forEach((monthInfo, monthIdx) => {
            const monthData = savingsData[monthIdx];
            const monthlyDeposits = sortedTxs
              .filter((tx) => {
                const txDate = new Date(tx.timestamp);
                return (
                  txDate.getMonth() === monthInfo.index &&
                  txDate.getFullYear() === monthInfo.year
                );
              })
              .reduce((sum, tx) => sum + tx.amount, 0);

            cumulativeBalance += monthlyDeposits;
            monthData[child.name] = monthlyDeposits;
            monthData[`${child.name}_cumulative`] = cumulativeBalance;
          });
        }
      });

      setChildSavingsData(savingsData);
    } else {
      // Generate simple sample data based on current balances without API calls
      console.log(
        '📊 Using sample data for charts (no transactions available)'
      );
      const anyChildHasBalance = children.some((child) => child.balance > 0);

      if (anyChildHasBalance) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const sampleData = months.map((month, i) => {
          const monthData: any = { month };
          children.forEach((child) => {
            const growthFactor = (i + 1) / months.length;
            monthData[child.name] = Math.round(
              child.balance * growthFactor * 0.2
            );
            monthData[`${child.name}_cumulative`] = Math.round(
              child.balance * growthFactor
            );
          });
          return monthData;
        });
        setChildSavingsData(sampleData);
      } else {
        setChildSavingsData([]);
      }
    }
  };

  // Call generateSavingsData when children data changes
  useEffect(() => {
    if (childrenData.length > 0) {
      generateSavingsData(childrenData, recentTransactions);
    } else {
      setChildSavingsData([]);
    }
  }, [childrenData, recentTransactions]);

  // Refresh balances
  const handleRefreshBalance = async () => {
    setIsLoadingBalance(true);
    toast({
      title: 'Refreshing balances',
      description: 'Getting the latest account information...',
    });
    try {
      const childrenResponse = await childrenApi.getChildren();
      const children = childrenResponse.children || [];
      const childrenWithGoals = await Promise.all(
        children.map(async (child: any) => {
          if (!child.goals) {
            const goalsResponse = await childrenApi.getChildDetails(child.id);
            return {
              ...child,
              goals: goalsResponse.goals || [],
            };
          }
          return child;
        })
      );
      setChildrenData(childrenWithGoals);
    } catch (error) {
      console.error('Error refreshing balances:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to refresh',
        description: 'Could not refresh balances. Please try again later.',
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Approve a goal
  const handleApproveGoal = async (goalId: string) => {
    try {
      console.log(`Attempting to approve goal: ${goalId}`);
      setIsLoading(true);

      // Call the API to approve the goal
      const response = await goalsApi.approveGoal(goalId);
      console.log('Approval response:', response);

      // Update the local state to reflect the change
      setChildrenData((prevChildren) =>
        prevChildren.map((child) => ({
          ...child,
          goals: child.goals.map((goal) =>
            goal.id === goalId ? { ...goal, status: 'approved' } : goal
          ),
        }))
      );

      toast({
        title: 'Goal Approved',
        description: 'The savings goal has been approved successfully.',
      });

      // Refresh goals to get the latest data
      await refreshGoals();
    } catch (error) {
      console.error('Error approving goal:', error);

      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      toast({
        variant: 'destructive',
        title: 'Failed to approve goal',
        description:
          error instanceof Error
            ? `Error: ${error.message}`
            : 'Could not approve the goal. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Approve goal deletion
  const handleApproveGoalDeletion = async (
    goalId: string,
    goalName: string
  ) => {
    try {
      console.log(`Attempting to approve deletion of goal: ${goalId}`);
      setIsLoading(true);

      // Call the API to delete the goal
      const response = await goalsApi.deleteGoal(goalId);
      console.log('Deletion response:', response);

      // Update the local state to remove the goal
      setChildrenData((prevChildren) =>
        prevChildren.map((child) => ({
          ...child,
          goals: child.goals.filter((goal) => goal.id !== goalId),
        }))
      );

      // Check if funds were refunded
      if (response.refunded && response.refunded > 0) {
        toast({
          title: 'Goal Deleted & Funds Refunded! 💰',
          description: `"${goalName}" deleted and ${response.refunded} sats refunded to child's balance.`,
        });
      } else {
        toast({
          title: 'Goal Deleted',
          description: `"${goalName}" has been deleted successfully.`,
        });
      }

      // Refresh goals to get the latest data
      await refreshGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);

      toast({
        variant: 'destructive',
        title: 'Failed to delete goal',
        description:
          error instanceof Error
            ? `Error: ${error.message}`
            : 'Could not delete the goal. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a refresh function for goals
  const refreshGoals = async () => {
    try {
      setIsLoading(true);
      console.log('Refreshing goals data...');

      // Fetch all children again
      const childrenResponse = await childrenApi.getChildren();
      const children = childrenResponse.children || [];

      // For each child, fetch their goals
      const updatedChildren = await Promise.all(
        children.map(async (child: any) => {
          try {
            const childDetails = await childrenApi.getChildDetails(child.id);

            // Try to get goals from the goals API
            let childGoals = [];
            try {
              if (typeof goalsApi.getSavingsGoals === 'function') {
                childGoals = await goalsApi.getSavingsGoals(child.id);
                console.log(`Refreshed goals for ${child.name}:`, childGoals);
              } else {
                console.log('getSavingsGoals method not available');
                // Try to get goals from child details
                childGoals = childDetails.goals || [];
              }
            } catch (goalError) {
              console.error(
                `Error fetching goals for child ${child.id}:`,
                goalError
              );
              // Fallback to goals from child details
              childGoals = childDetails.goals || [];
            }

            return {
              id: child.id,
              jarId: child.jarId || childDetails.jarId || '',
              name: child.name,
              balance: childDetails.balance || child.balance || 0,
              goals: (childGoals || []).map((goal: any) => ({
                id: goal.id,
                name: goal.name,
                target: goal.targetAmount || goal.target || 0,
                current: goal.currentAmount || goal.current || 0,
                createdAt: goal.createdAt, // Include creation timestamp
                deletionRequested: goal.deletionRequested || false, // Include deletion request status
                deletionRequestedAt: goal.deletionRequestedAt, // Include deletion request timestamp
                status:
                  goal.status ||
                  (goal.approved
                    ? goal.currentAmount >= goal.targetAmount
                      ? 'completed'
                      : 'approved'
                    : 'pending'),
              })),
            };
          } catch (error) {
            console.error(
              `Error refreshing data for child ${child.id}:`,
              error
            );
            return {
              id: child.id,
              jarId: child.jarId || '',
              name: child.name,
              balance: child.balance || 0,
              goals: [],
            };
          }
        })
      );

      setChildrenData(updatedChildren);
      console.log('Goals refreshed successfully:', updatedChildren);

      // Show success toast
      toast({
        title: 'Goals refreshed',
        description: 'The latest goals data has been loaded.',
      });
    } catch (error) {
      console.error('Error refreshing goals:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to refresh goals. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedChildData = childrenData.find((c) => c.id === selectedChild);

  // Generate achievement badges based on real data
  const generateAchievementBadges = (child: Child) => {
    const achievements = childrenAchievements[child.id] || [];
    const badges = [];

    // Define achievement types and their corresponding badges
    const achievementTypes = {
      first_deposit: {
        name: 'First Saver',
        icon: <Star className='h-6 w-6 text-white' />,
        gradient: 'from-amber-400 to-yellow-500',
        description: 'Made first deposit',
      },
      quiz_perfect: {
        name: 'Quiz Master',
        icon: <Book className='h-6 w-6 text-white' />,
        gradient: 'from-blue-400 to-blue-600',
        description: 'Perfect quiz score',
      },
      first_lesson: {
        name: 'Learning Star',
        icon: <Book className='h-6 w-6 text-white' />,
        gradient: 'from-purple-400 to-purple-600',
        description: 'Completed first lesson',
      },
      module_completed: {
        name: 'Module Master',
        icon: <Award className='h-6 w-6 text-white' />,
        gradient: 'from-green-400 to-green-600',
        description: 'Completed learning module',
      },
      goal_achieved: {
        name: 'Goal Achiever',
        icon: <Star className='h-6 w-6 text-white' />,
        gradient: 'from-indigo-400 to-indigo-600',
        description: 'Reached savings goal',
      },
      saving_streak: {
        name: 'Saving Streak',
        icon: <Award className='h-6 w-6 text-white' />,
        gradient: 'from-orange-400 to-red-500',
        description: 'Consistent saver',
      },
    };

    // Add earned achievements
    achievements.forEach((achievement) => {
      const badgeConfig =
        achievementTypes[achievement.type as keyof typeof achievementTypes];
      if (badgeConfig) {
        badges.push({
          ...badgeConfig,
          earned: true,
          earnedDate: achievement.awarded,
          id: achievement.id,
        });
      }
    });

    // Add potential achievements based on child's data
    const hasBalance = child.balance > 0;
    const hasGoals = child.goals && child.goals.length > 0;
    const hasCompletedGoals =
      child.goals && child.goals.some((g) => g.status === 'completed');

    // First Saver - if has balance but no achievement yet
    if (hasBalance && !achievements.some((a) => a.type === 'first_deposit')) {
      badges.push({
        ...achievementTypes.first_deposit,
        earned: false,
        id: 'potential_first_deposit',
      });
    }

    // Goal Achiever - if has completed goals but no achievement yet
    if (
      hasCompletedGoals &&
      !achievements.some((a) => a.type === 'goal_achieved')
    ) {
      badges.push({
        ...achievementTypes.goal_achieved,
        earned: false,
        id: 'potential_goal_achieved',
      });
    }

    // Add some default potential achievements if none exist
    if (badges.length === 0) {
      badges.push(
        {
          ...achievementTypes.first_deposit,
          earned: false,
          id: 'potential_first_deposit',
        },
        {
          ...achievementTypes.quiz_perfect,
          earned: false,
          id: 'potential_quiz_perfect',
        },
        {
          ...achievementTypes.goal_achieved,
          earned: false,
          id: 'potential_goal_achieved',
        }
      );
    }

    // Limit to 5 badges for display
    return badges.slice(0, 5);
  };

  // Define handleTabChange early to avoid hoisting issues
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'children') {
      setShowManageChildren(true);
    } else if (tab === 'settings') {
      toast({
        title: 'Settings',
        description: 'Settings page coming soon!',
      });
    }
  };

  if (isLoadingData && childrenData.length === 0) {
    return (
      <ResponsiveLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={logout}
        userRole='parent'
        userName={user?.name}
      >
        <DesktopContentLayout maxWidth='xl'>
          <div className='space-y-6 animate-fade-in'>
            <div className='flex items-center justify-center min-h-[400px]'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                  Loading Family Dashboard
                </h2>
                <p className='text-muted-foreground mb-4'>
                  {serverStatus === 'connecting'
                    ? 'Getting your family data...'
                    : serverStatus === 'error'
                    ? 'Having trouble connecting'
                    : 'Almost ready...'}
                </p>

                {/* Simple progress indicator */}
                <div className='w-full bg-gray-200 rounded-full h-2 mb-4'>
                  <div
                    className='bg-blue-600 h-2 rounded-full animate-pulse'
                    style={{ width: '60%' }}
                  ></div>
                </div>

                {/* User-friendly tips */}
                <div className='text-sm text-muted-foreground'>
                  <p>💡 This usually takes just a few seconds</p>
                </div>
              </div>
            </div>
          </div>
        </DesktopContentLayout>
      </ResponsiveLayout>
    );
  }

  if (showManageChildren) {
    return (
      <>
        <ManageChildren
          onBack={() => setShowManageChildren(false)}
          onFundChild={handleAddFunds}
          onViewChildDashboard={handleViewChildDashboard}
          onChildrenUpdated={(updatedChildren) => {
            setChildrenData(updatedChildren);
          }}
          onRefreshData={fetchChildrenData}
          children={childrenData}
        />

        <AddFundsModal
          open={fundChildModal.open}
          onOpenChange={(open) => {
            setFundChildModal({
              open,
              childId: open ? fundChildModal.childId : '',
              childName: open ? fundChildModal.childName : '',
            });
          }}
          childName={fundChildModal.childName}
          childId={fundChildModal.childId}
          onSuccess={() => {
            fetchChildrenData();
          }}
        />
      </>
    );
  }

  const ServerStatusIndicator = () => {
    if (serverStatus === 'connected') return null;

    return (
      <div
        className={`p-3 mb-4 rounded-lg ${
          serverStatus === 'connecting' ? 'bg-yellow-100' : 'bg-red-100'
        }`}
      >
        <div className='flex items-center'>
          {serverStatus === 'connecting' ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin text-yellow-600' />
              <p className='text-yellow-800'>Connecting to server...</p>
            </>
          ) : (
            <>
              <AlertTriangle className='h-4 w-4 mr-2 text-red-600' />
              <div>
                <p className='text-red-800 font-medium'>
                  Cannot connect to server
                </p>
                <p className='text-red-700 text-sm'>
                  {process.env.NODE_ENV === 'development'
                    ? 'Using sample data. Please check if the backend server is running.'
                    : 'Please try again later or contact support.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={logout}
      userRole='parent'
      userName={user?.name}
    >
      <DesktopContentLayout maxWidth='xl'>
        <div className='space-y-6 animate-fade-in'>
          {/* Server status indicator */}
          <ServerStatusIndicator />
          {/* Parent Profile Card */}
          <Card className='bg-gradient-to-r from-blue-600 to-indigo-700 text-white mb-4'>
            <CardContent className='p-6'>
              <div className='flex justify-between items-start'>
                <div>
                  <h2 className='text-xl font-bold'>
                    {user?.name || 'Parent'}'s Dashboard
                  </h2>
                  <p className='text-blue-100 text-sm mt-1'>
                    Managing {childrenData.length}{' '}
                    {childrenData.length === 1 ? 'child' : 'children'}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  className='h-8 w-8 rounded-full p-0 bg-white/20 hover:bg-white/30 text-white'
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
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6'>
                <div className='bg-white/10 rounded-lg p-3'>
                  <p className='text-xs text-white/70'>Children</p>
                  <p className='text-xl font-bold text-white'>
                    {childrenData.length}
                  </p>
                </div>
                <div className='bg-white/10 rounded-lg p-3'>
                  <p className='text-xs text-white/70'>Pending Goals</p>
                  <p className='text-xl font-bold text-white'>
                    {parentMetrics.pendingGoals}
                  </p>
                </div>
                <div className='bg-white/10 rounded-lg p-3 hidden sm:block'>
                  <p className='text-xs text-white/70'>Active Savings</p>
                  <p className='text-xl font-bold text-white'>
                    {childrenData.filter((c) => c.balance > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Family Savings Metrics Dashboard */}
          <Card className='mb-4 bg-glass backdrop-blur-sm border-white/20 shadow-glass hover:shadow-glass-lg transition-all duration-300 hover:transform hover:-translate-y-1'>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <Trophy className='h-5 w-5 mr-2 text-amber-500' />
                Family Savings Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {/* Total Family Savings */}
                <div className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800'>
                  <p className='text-xs text-green-700 dark:text-green-300 font-medium'>
                    Total Savings
                  </p>
                  <p className='text-xl font-bold text-green-800 dark:text-green-200'>
                    {formatCurrency(parentMetrics.totalSaved)}
                  </p>
                  <p className='text-xs text-green-600 dark:text-green-400 mt-1'>
                    Across {childrenData.length}{' '}
                    {childrenData.length === 1 ? 'child' : 'children'}
                  </p>
                </div>

                {/* Goals Completion Rate */}
                <div className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800'>
                  <p className='text-xs text-blue-700 dark:text-blue-300 font-medium'>
                    Goals Completion
                  </p>
                  <div className='flex items-center gap-2'>
                    <p className='text-xl font-bold text-blue-800 dark:text-blue-200'>
                      {parentMetrics.totalGoals > 0
                        ? Math.round(
                            (parentMetrics.completedGoals /
                              parentMetrics.totalGoals) *
                              100
                          )
                        : 0}
                      %
                    </p>
                    <div className='text-xs'>
                      <span className='text-green-600 font-medium'>
                        {parentMetrics.completedGoals}
                      </span>
                      <span className='text-muted-foreground'>
                        /{parentMetrics.totalGoals}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      parentMetrics.totalGoals > 0
                        ? (parentMetrics.completedGoals /
                            parentMetrics.totalGoals) *
                          100
                        : 0
                    }
                    className='h-2 mt-2'
                  />
                </div>

                {/* Average Goal Progress */}
                <div className='bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800'>
                  <p className='text-xs text-purple-700 dark:text-purple-300 font-medium'>
                    Avg Goal Progress
                  </p>
                  <div className='flex items-center gap-2'>
                    <p className='text-xl font-bold text-purple-800 dark:text-purple-200'>
                      {Math.round(parentMetrics.averageGoalProgress)}%
                    </p>
                  </div>
                  <Progress
                    value={parentMetrics.averageGoalProgress}
                    className='h-2 mt-2'
                  />
                  <p className='text-xs text-purple-600 dark:text-purple-400 mt-1'>
                    {parentMetrics.approvedGoals} active goals
                  </p>
                </div>

                {/* Active Children */}
                <div className='bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800'>
                  <p className='text-xs text-amber-700 dark:text-amber-300 font-medium'>
                    Active Children
                  </p>
                  <p className='text-xl font-bold text-amber-800 dark:text-amber-200'>
                    {parentMetrics.activeChildren}
                  </p>
                  <p className='text-xs text-amber-600 dark:text-amber-400 mt-1'>
                    {childrenData.length > 0
                      ? Math.round(
                          (parentMetrics.activeChildren / childrenData.length) *
                            100
                        )
                      : 0}
                    % engagement rate
                  </p>
                </div>

                {/* Pending Approvals */}
                <div className='bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800'>
                  <p className='text-xs text-red-700 dark:text-red-300 font-medium'>
                    Pending Approvals
                  </p>
                  <p className='text-xl font-bold text-red-800 dark:text-red-200'>
                    {parentMetrics.pendingGoals}
                  </p>
                  <p className='text-xs text-red-600 dark:text-red-400 mt-1'>
                    {parentMetrics.pendingGoals === 0
                      ? 'All caught up!'
                      : 'Creation & deletion approvals'}
                  </p>
                </div>

                {/* Learning Progress */}
                <div className='bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-3 rounded-lg border border-teal-200 dark:border-teal-800'>
                  <p className='text-xs text-teal-700 dark:text-teal-300 font-medium'>
                    Learning Progress
                  </p>
                  <div className='flex items-center gap-2'>
                    <p className='text-xl font-bold text-teal-800 dark:text-teal-200'>
                      {Math.round(parentMetrics.learningProgress)}%
                    </p>
                  </div>
                  <Progress
                    value={parentMetrics.learningProgress}
                    className='h-2 mt-2'
                  />
                  <p className='text-xs text-teal-600 dark:text-teal-400 mt-1'>
                    Based on goal achievements
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Currently Active Child */}
          {currentlyLoggedInChild && (
            <Card className='mb-4 border-green-500/30 dark:border-green-700/30 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm shadow-glass hover:shadow-glass-lg transition-all duration-300 hover:transform hover:-translate-y-1'>
              <CardHeader className='pb-2'>
                <div className='flex justify-between items-center'>
                  <CardTitle className='text-lg flex items-center'>
                    <div className='w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse'></div>
                    Currently Active Child
                  </CardTitle>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      handleViewChildDashboard(currentlyLoggedInChild.id)
                    }
                    className='bg-white border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800'
                  >
                    View Dashboard
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center'>
                    <div className='h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg'>
                      {currentlyLoggedInChild.name.charAt(0)}
                    </div>
                    <div className='ml-3'>
                      <p className='text-xs text-muted-foreground'>
                        Jar ID: {currentlyLoggedInChild.jarId}
                      </p>
                      <div className='flex items-center mt-1'>
                        <div className='w-2 h-2 bg-green-500 rounded-full mr-1'></div>
                        <p className='text-xs text-green-600 dark:text-green-400 font-medium'>
                          Currently active
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-xl text-green-700 dark:text-green-300'>
                      {formatCurrency(currentlyLoggedInChild.balance)}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Current Balance
                    </p>
                  </div>
                </div>

                {/* Activity Summary */}
                <div className='grid grid-cols-3 gap-2 mb-4'>
                  <div className='bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg text-center'>
                    <p className='text-lg font-bold text-blue-600 dark:text-blue-400'>
                      {currentlyLoggedInChild.goals
                        ? currentlyLoggedInChild.goals.length
                        : 0}
                    </p>
                    <p className='text-xs text-muted-foreground'>Goals</p>
                  </div>
                  <div className='bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg text-center'>
                    <p className='text-lg font-bold text-green-600 dark:text-green-400'>
                      {currentlyLoggedInChild.goals
                        ? currentlyLoggedInChild.goals.filter(
                            (g) => g.status === 'completed'
                          ).length
                        : 0}
                    </p>
                    <p className='text-xs text-muted-foreground'>Completed</p>
                  </div>
                  <div className='bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg text-center'>
                    <p className='text-lg font-bold text-amber-600 dark:text-amber-400'>
                      {currentlyLoggedInChild.goals
                        ? currentlyLoggedInChild.goals.filter(
                            (g) => g.status === 'approved'
                          ).length
                        : 0}
                    </p>
                    <p className='text-xs text-muted-foreground'>Active</p>
                  </div>
                </div>

                {/* Current Primary Goal */}
                {currentlyLoggedInChild.goals &&
                  currentlyLoggedInChild.goals.length > 0 && (
                    <div className='mb-4'>
                      <p className='text-sm font-medium mb-2 flex items-center'>
                        <Star className='h-4 w-4 mr-1 text-amber-500' />
                        Primary Goal
                      </p>
                      <div className='bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-white/50'>
                        <div className='flex justify-between mb-2'>
                          <p className='text-sm font-medium'>
                            {currentlyLoggedInChild.goals[0].name}
                          </p>
                          <div className='flex items-center'>
                            <p className='text-sm font-bold text-green-600 dark:text-green-400'>
                              {Math.round(
                                (currentlyLoggedInChild.goals[0].current /
                                  currentlyLoggedInChild.goals[0].target) *
                                  100
                              )}
                              %
                            </p>
                            <div
                              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                currentlyLoggedInChild.goals[0].status ===
                                'completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : currentlyLoggedInChild.goals[0].status ===
                                    'approved'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}
                            >
                              {currentlyLoggedInChild.goals[0].status ===
                              'completed'
                                ? 'Completed'
                                : currentlyLoggedInChild.goals[0].status ===
                                  'approved'
                                ? 'Active'
                                : 'Pending'}
                            </div>
                          </div>
                        </div>
                        <DesktopProgressBar
                          value={
                            (currentlyLoggedInChild.goals[0].current /
                              currentlyLoggedInChild.goals[0].target) *
                            100
                          }
                          maxWidth='lg'
                          className='mb-2'
                        />
                        <div className='flex justify-between'>
                          <p className='text-xs text-muted-foreground'>
                            {formatCurrency(
                              currentlyLoggedInChild.goals[0].current
                            )}{' '}
                            saved
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {formatCurrency(
                              currentlyLoggedInChild.goals[0].target -
                                currentlyLoggedInChild.goals[0].current
                            )}{' '}
                            remaining
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Quick Actions */}
                {/* Mobile: Compact buttons with enhanced styling */}
                <div className='grid grid-cols-3 gap-3 lg:hidden'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleAddFunds(currentlyLoggedInChild.id)}
                    className='text-xs bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border border-green-200/50 dark:border-green-700/30 px-3 py-2 h-9 transition-all duration-300 hover:scale-105 hover:shadow-md backdrop-blur-sm font-medium'
                  >
                    <Plus className='h-3 w-3 mr-1 drop-shadow-sm' />
                    Add
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      navigate(
                        `/child-dashboard/${currentlyLoggedInChild.id}/learning`
                      );
                    }}
                    className='text-xs bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border border-blue-200/50 dark:border-blue-700/30 px-3 py-2 h-9 transition-all duration-300 hover:scale-105 hover:shadow-md backdrop-blur-sm font-medium'
                  >
                    <Book className='h-3 w-3 mr-1 drop-shadow-sm' />
                    Learn
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      navigate(
                        `/child-dashboard/${currentlyLoggedInChild.id}/goals`
                      );
                    }}
                    className='text-xs bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border border-amber-200/50 dark:border-amber-700/30 px-3 py-2 h-9 transition-all duration-300 hover:scale-105 hover:shadow-md backdrop-blur-sm font-medium'
                  >
                    <Star className='h-3 w-3 mr-1 drop-shadow-sm' />
                    Goals
                  </Button>
                </div>
                {/* Desktop: Centered buttons with enhanced styling */}
                <DesktopButtonGroup
                  variant='grid'
                  maxWidth='lg'
                  className='hidden lg:grid'
                >
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleAddFunds(currentlyLoggedInChild.id)}
                    className='text-sm bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border border-green-200/50 dark:border-green-700/30 px-4 py-3 transition-all duration-300 hover:scale-105 hover:shadow-md backdrop-blur-sm font-medium'
                  >
                    <Plus className='h-4 w-4 mr-2 drop-shadow-sm' />
                    Add Funds
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      navigate(
                        `/child-dashboard/${currentlyLoggedInChild.id}/learning`
                      );
                    }}
                    className='text-sm bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border border-blue-200/50 dark:border-blue-700/30 px-4 py-3 transition-all duration-300 hover:scale-105 hover:shadow-md backdrop-blur-sm font-medium'
                  >
                    <Book className='h-4 w-4 mr-2 drop-shadow-sm' />
                    Learning
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      navigate(
                        `/child-dashboard/${currentlyLoggedInChild.id}/goals`
                      );
                    }}
                    className='text-sm bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border border-amber-200/50 dark:border-amber-700/30 px-4 py-3 transition-all duration-300 hover:scale-105 hover:shadow-md backdrop-blur-sm font-medium'
                  >
                    <Star className='h-4 w-4 mr-2 drop-shadow-sm' />
                    Goals
                  </Button>
                </DesktopButtonGroup>
              </CardContent>
            </Card>
          )}

          {/* Manage Children Button */}
          <DesktopButtonGroup variant='inline' maxWidth='md'>
            <Button
              onClick={() => setShowManageChildren(true)}
              className='bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 px-8 py-3 shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/30 text-white font-semibold'
            >
              <Users className='mr-2 h-5 w-5 drop-shadow-sm' />
              Manage Children
            </Button>
          </DesktopButtonGroup>

          {/* Tabs Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid grid-cols-5 mb-4'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='goals'>Goals</TabsTrigger>
              <TabsTrigger value='savings'>Savings</TabsTrigger>
              <TabsTrigger value='learning'>Learning</TabsTrigger>
              <TabsTrigger value='achievements'>Achievements</TabsTrigger>
            </TabsList>

            {/* Overview Tab Content */}
            <TabsContent value='overview' className='space-y-4'>
              {/* Children's Jars */}
              <Card className='bg-glass backdrop-blur-sm border-white/20 shadow-glass hover:shadow-glass-lg transition-all duration-300 hover:transform hover:-translate-y-1'>
                <CardHeader className='pb-2'>
                  <div className='flex justify-between items-center'>
                    <CardTitle className='text-lg flex items-center'>
                      <User className='h-5 w-5 mr-2' />
                      Children's Savings Jars
                    </CardTitle>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setIsJarsExpanded(!isJarsExpanded)}
                      className='h-8 w-8 p-0'
                    >
                      {isJarsExpanded ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='p-4'>
                  {childrenData.length === 0 ? (
                    <div className='text-center py-4 text-muted-foreground'>
                      No children added yet.
                      <Button
                        variant='outline'
                        size='sm'
                        className='mt-2'
                        onClick={() => setShowManageChildren(true)}
                      >
                        Add Children
                      </Button>
                    </div>
                  ) : !isJarsExpanded ? (
                    <div className='text-center py-2'>
                      <Button
                        variant='ghost'
                        onClick={() => setIsJarsExpanded(true)}
                        className='text-sm text-muted-foreground'
                      >
                        {childrenData.length}{' '}
                        {childrenData.length === 1 ? 'child' : 'children'} •
                        Click to expand
                      </Button>
                    </div>
                  ) : (
                    <div className='space-y-4 max-h-80 overflow-y-auto'>
                      {childrenData.map((child) => (
                        <div
                          key={child.id}
                          className='flex items-center justify-between border-b pb-3 last:border-0 last:pb-0'
                        >
                          <div className='flex items-center'>
                            <div className='bg-primary/10 rounded-full p-2 mr-3'>
                              <User className='h-5 w-5 text-primary' />
                            </div>
                            <div>
                              <h4 className='font-medium'>{child.name}</h4>
                              <p className='text-sm text-muted-foreground'>
                                Jar ID: {child.jarId}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='text-right'>
                              <p className='font-medium'>
                                {formatCurrency(child.balance)}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                Balance
                              </p>
                            </div>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    className='bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30'
                                    onClick={() => handleAddFunds(child.id)}
                                  >
                                    <Coins className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Add Funds to {child.name}'s Jar</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size='sm'
                                    onClick={() =>
                                      handleViewChildDashboard(child.id)
                                    }
                                    className='relative'
                                  >
                                    <ChevronRight className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View {child.name}'s Dashboard</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Savings Growth Chart */}
              <Card>
                <CardHeader>
                  <div className='flex justify-between items-center'>
                    <div>
                      <CardTitle className='text-lg'>
                        Children's Savings Growth
                      </CardTitle>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Monthly deposits over the last 6 months
                        {childSavingsData.length > 0 && (
                          <span className='ml-2 text-green-600 font-medium'>
                            • {childrenData.filter((c) => c.balance > 0).length}{' '}
                            active savers
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        generateSavingsData(childrenData, recentTransactions)
                      }
                      className='h-8 w-8 p-0'
                      title='Refresh chart data'
                    >
                      <RefreshCcw className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {childrenData.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      <p>No children data available</p>
                      <Button
                        variant='outline'
                        size='sm'
                        className='mt-2'
                        onClick={() => setShowManageChildren(true)}
                      >
                        Add Children
                      </Button>
                    </div>
                  ) : childSavingsData.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      <p>No savings data available yet</p>
                      <p className='text-xs mt-1'>
                        Encourage child saving to see growth charts
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width='100%' height={250}>
                      <BarChart data={childSavingsData}>
                        <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
                        <XAxis dataKey='month' />
                        <YAxis tickFormatter={(value) => `${value} sats`} />
                        <RechartsTooltip
                          formatter={(value, name) => {
                            const child = childrenData.find(
                              (c) => c.name === name
                            );
                            const numericValue = Number(value);

                            return [
                              `${numericValue.toLocaleString()} sats`,
                              <>
                                <div className='flex items-center gap-2'>
                                  <div
                                    className='w-3 h-3 rounded-full'
                                    style={{
                                      backgroundColor: childrenData.map(
                                        (child, index) => {
                                          const colors = [
                                            '#f59e0b',
                                            '#3b82f6',
                                            '#8b5cf6',
                                            '#ec4899',
                                            '#10b981',
                                            '#6366f1',
                                          ];
                                          return colors[index % colors.length];
                                        }
                                      )[
                                        childrenData.findIndex(
                                          (c) => c.name === name
                                        )
                                      ],
                                    }}
                                  />
                                  <span className='font-medium'>{name}</span>
                                </div>
                                {child && (
                                  <div className='text-xs text-muted-foreground mt-1 space-y-1'>
                                    <div>Jar ID: {child.jarId}</div>
                                    <div>
                                      Current Balance:{' '}
                                      {child.balance.toLocaleString()} sats
                                    </div>
                                    {numericValue > 0 && (
                                      <div className='text-green-600 font-medium'>
                                        Monthly Deposit:{' '}
                                        {numericValue.toLocaleString()} sats
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>,
                            ];
                          }}
                          labelFormatter={(label) => {
                            const monthData = childSavingsData.find(
                              (d) => d.month === label
                            );
                            return monthData ? `${monthData.monthYear}` : label;
                          }}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                        {childrenData.map((child, index) => {
                          const colors = [
                            '#f59e0b',
                            '#3b82f6',
                            '#8b5cf6',
                            '#ec4899',
                            '#10b981',
                            '#6366f1',
                          ];
                          const colorIndex = index % colors.length;
                          return (
                            <Bar
                              key={child.id}
                              dataKey={child.name}
                              fill={colors[colorIndex]}
                              name={child.name}
                              animationDuration={1500}
                            />
                          );
                        })}
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {/* Chart Legend */}
                  {childSavingsData.length > 0 && childrenData.length > 0 && (
                    <div className='mt-4 pt-4 border-t'>
                      <div className='flex flex-wrap gap-4 justify-center'>
                        {childrenData.map((child, index) => {
                          const colors = [
                            '#f59e0b',
                            '#3b82f6',
                            '#8b5cf6',
                            '#ec4899',
                            '#10b981',
                            '#6366f1',
                          ];
                          const color = colors[index % colors.length];

                          return (
                            <div
                              key={child.id}
                              className='flex items-center gap-2 text-sm'
                            >
                              <div
                                className='w-3 h-3 rounded-full'
                                style={{ backgroundColor: color }}
                              />
                              <span className='font-medium'>{child.jarId}</span>
                              <span className='text-xs bg-gray-100 px-2 py-1 rounded'>
                                {child.balance.toLocaleString()} sats
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Chart Summary */}
                      <div className='mt-3 text-center text-xs text-muted-foreground'>
                        Total Family Savings:{' '}
                        {childrenData
                          .reduce((sum, child) => sum + child.balance, 0)
                          .toLocaleString()}{' '}
                        sats
                        {childSavingsData.length > 0 && (
                          <span className='ml-3'>
                            • Showing data from {childSavingsData[0]?.monthYear}{' '}
                            to{' '}
                            {
                              childSavingsData[childSavingsData.length - 1]
                                ?.monthYear
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader className='pb-2'>
                  <div className='flex justify-between items-center'>
                    <CardTitle className='text-lg flex items-center'>
                      <History className='h-5 w-5 mr-2' />
                      Recent Activities
                    </CardTitle>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        setIsActivitiesExpanded(!isActivitiesExpanded)
                      }
                      className='h-8 w-8 p-0'
                    >
                      {isActivitiesExpanded ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {isActivitiesExpanded && (
                  <CardContent className='p-4'>
                    <div className='flex justify-between items-center mb-4'>
                      <div className='text-sm text-muted-foreground'>
                        Showing recent child activities
                      </div>
                      <div className='flex gap-1'>
                        <Button
                          variant={
                            activityFilter === 'all' ? 'default' : 'outline'
                          }
                          size='sm'
                          onClick={() => setActivityFilter('all')}
                        >
                          All
                        </Button>
                        <Button
                          variant={
                            activityFilter === 'transactions'
                              ? 'default'
                              : 'outline'
                          }
                          size='sm'
                          onClick={() => setActivityFilter('transactions')}
                        >
                          Transactions
                        </Button>
                        <Button
                          variant={
                            activityFilter === 'goals' ? 'default' : 'outline'
                          }
                          size='sm'
                          onClick={() => setActivityFilter('goals')}
                        >
                          Goals
                        </Button>
                        <Button
                          variant={
                            activityFilter === 'learning'
                              ? 'default'
                              : 'outline'
                          }
                          size='sm'
                          onClick={() => setActivityFilter('learning')}
                        >
                          Learning
                        </Button>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      {filteredActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className='flex items-center justify-between py-2 border-b last:border-0'
                        >
                          <div>
                            <p className='font-medium'>{activity.childJarId}</p>
                            <div className='flex items-center'>
                              <span
                                className={`w-2 h-2 rounded-full mr-1 ${
                                  activity.type === 'deposit'
                                    ? 'bg-green-500'
                                    : activity.type === 'withdrawal'
                                    ? 'bg-red-500'
                                    : activity.type === 'goal_created' ||
                                      activity.type === 'goal_completed'
                                    ? 'bg-amber-500'
                                    : activity.type === 'quiz_completed' ||
                                      activity.type === 'lesson_completed'
                                    ? 'bg-blue-500'
                                    : 'bg-purple-500'
                                }`}
                              ></span>
                              <p className='text-xs text-muted-foreground capitalize'>
                                {getActivityTypeLabel(activity.type)} •{' '}
                                {new Date(activity.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className='text-right'>
                            {activity.type === 'deposit' ||
                            activity.type === 'withdrawal' ? (
                              <span
                                className={
                                  activity.amount && activity.amount > 0
                                    ? 'text-green-600 font-medium'
                                    : 'text-red-600 font-medium'
                                }
                              >
                                {activity.amount && activity.amount > 0
                                  ? '+'
                                  : ''}
                                {activity.amount} sats
                              </span>
                            ) : activity.type === 'goal_created' ||
                              activity.type === 'goal_completed' ? (
                              <span className='text-amber-600 font-medium'>
                                {activity.goalName}
                              </span>
                            ) : activity.type === 'quiz_completed' ? (
                              <span className='text-blue-600 font-medium'>
                                Score: {activity.score}
                              </span>
                            ) : activity.type === 'lesson_completed' ? (
                              <span className='text-blue-600 font-medium'>
                                {activity.lessonName}
                              </span>
                            ) : (
                              <span className='text-purple-600 font-medium'>
                                {activity.description || 'Activity completed'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full mt-4'
                      onClick={handleViewAllActivities}
                    >
                      View All Activities
                    </Button>
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            {/* Goals Tab Content */}
            <TabsContent value='goals' className='space-y-4'>
              <div className='flex justify-between items-center mb-4'>
                <CardTitle className='text-lg flex items-center'>
                  <Star className='h-5 w-5 mr-2' />
                  Savings Goals
                </CardTitle>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={refreshGoals}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className='mr-2 h-4 w-4' />
                      Refresh Goals
                    </>
                  )}
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center'>
                    <ClockIcon className='h-5 w-5 mr-2 text-amber-500' />
                    Pending Approval
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-4'>
                  {/* Goal Creation Approvals */}
                  {childrenData.flatMap((child) =>
                    child.goals
                      .filter((goal) => goal.status === 'pending')
                      .map((goal) => (
                        <div
                          key={goal.id}
                          className='border-b pb-4 mb-4 last:border-0 last:mb-0 last:pb-0'
                        >
                          <div className='flex justify-between items-start mb-2'>
                            <div>
                              <p className='font-medium'>{goal.name}</p>
                              <p className='text-xs text-muted-foreground'>
                                Jar: {child.jarId}
                              </p>
                              <p className='text-xs text-blue-600 mt-1'>
                                Child created new goal
                              </p>
                            </div>
                            <Button
                              size='sm'
                              className='bg-green-600 hover:bg-green-700'
                              onClick={() => handleApproveGoal(goal.id)}
                            >
                              Approve Creation
                            </Button>
                          </div>
                          <div className='space-y-1'>
                            <div className='flex justify-between text-xs'>
                              <span>{goal.current} sats</span>
                              <span>{goal.target} sats</span>
                            </div>
                            <Progress
                              value={(goal.current / goal.target) * 100}
                            />
                          </div>
                        </div>
                      ))
                  )}

                  {/* Goal Deletion Approvals */}
                  {childrenData.flatMap((child) =>
                    child.goals
                      .filter((goal) => goal.deletionRequested)
                      .map((goal) => (
                        <div
                          key={`delete-${goal.id}`}
                          className='border-b pb-4 mb-4 last:border-0 last:mb-0 last:pb-0 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg'
                        >
                          <div className='flex justify-between items-start mb-2'>
                            <div>
                              <p className='font-medium'>{goal.name}</p>
                              <p className='text-xs text-muted-foreground'>
                                Jar: {child.jarId}
                              </p>
                              <p className='text-xs text-red-600 mt-1 flex items-center'>
                                <Trash2 className='h-3 w-3 mr-1' />
                                Child requested deletion
                              </p>
                            </div>
                            <Button
                              size='sm'
                              variant='destructive'
                              className='bg-red-600 hover:bg-red-700'
                              onClick={() =>
                                handleApproveGoalDeletion(goal.id, goal.name)
                              }
                            >
                              Approve Deletion
                            </Button>
                          </div>
                          <div className='space-y-1'>
                            <div className='flex justify-between text-xs'>
                              <span>{goal.current} sats</span>
                              <span>{goal.target} sats</span>
                            </div>
                            <Progress
                              value={(goal.current / goal.target) * 100}
                              variant='amber'
                              size='md'
                              showPercentage={true}
                              showMarkers={true}
                              label={`${goal.current.toLocaleString()} / ${goal.target.toLocaleString()} sats`}
                            />
                          </div>
                        </div>
                      ))
                  )}

                  {/* No pending items message */}
                  {!childrenData.some((child) =>
                    child.goals.some(
                      (goal) =>
                        goal.status === 'pending' || goal.deletionRequested
                    )
                  ) && (
                    <div className='text-center py-6 text-muted-foreground'>
                      No pending approvals
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <div className='flex justify-between items-center'>
                    <CardTitle className='text-lg flex items-center'>
                      <CheckCircle2 className='h-5 w-5 mr-2 text-blue-500' />
                      Approved Goals
                    </CardTitle>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        setIsApprovedGoalsExpanded(!isApprovedGoalsExpanded)
                      }
                      className='h-8 w-8 p-0'
                    >
                      {isApprovedGoalsExpanded ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='p-4'>
                  {!isApprovedGoalsExpanded ? (
                    <div className='text-center py-2'>
                      <Button
                        variant='ghost'
                        onClick={() => setIsApprovedGoalsExpanded(true)}
                        className='text-sm text-muted-foreground'
                      >
                        {
                          childrenData.flatMap((child) =>
                            child.goals.filter(
                              (goal) => goal.status === 'approved'
                            )
                          ).length
                        }{' '}
                        approved goals • Click to expand
                      </Button>
                    </div>
                  ) : (
                    <>
                      {childrenData.flatMap((child) =>
                        child.goals
                          .filter((goal) => goal.status === 'approved')
                          .map((goal) => (
                            <div
                              key={goal.id}
                              className='border-b pb-4 mb-4 last:border-0 last:mb-0 last:pb-0'
                            >
                              <div className='flex justify-between mb-2'>
                                <div>
                                  <p className='font-medium'>{goal.name}</p>
                                  <p className='text-xs text-muted-foreground'>
                                    Jar: {child.jarId}
                                  </p>
                                </div>
                                <div className='text-xs text-right'>
                                  <p className='text-green-600 font-medium'>
                                    Approved
                                  </p>
                                  <p className='text-muted-foreground'>
                                    {Math.round(
                                      (goal.current / goal.target) * 100
                                    )}
                                    % completed
                                  </p>
                                </div>
                              </div>
                              <div className='space-y-1'>
                                <div className='flex justify-between text-xs'>
                                  <span>{goal.current} sats</span>
                                  <span>{goal.target} sats</span>
                                </div>
                                <Progress
                                  value={(goal.current / goal.target) * 100}
                                  variant='amber'
                                  size='md'
                                  showPercentage={true}
                                  showMarkers={true}
                                  label={`${goal.current.toLocaleString()} / ${goal.target.toLocaleString()} sats`}
                                />
                              </div>
                            </div>
                          ))
                      )}
                      {!childrenData.some((child) =>
                        child.goals.some((goal) => goal.status === 'approved')
                      ) && (
                        <div className='text-center py-6 text-muted-foreground'>
                          No approved goals yet
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              <Card className='mt-4'>
                <CardHeader className='pb-2'>
                  <div className='flex justify-between items-center'>
                    <CardTitle className='text-lg flex items-center'>
                      <Trophy className='h-5 w-5 mr-2 text-green-600' />
                      Completed Goals
                    </CardTitle>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        setIsCompletedGoalsExpanded(!isCompletedGoalsExpanded)
                      }
                      className='h-8 w-8 p-0'
                    >
                      {isCompletedGoalsExpanded ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='p-4'>
                  {!isCompletedGoalsExpanded ? (
                    <div className='text-center py-2'>
                      <Button
                        variant='ghost'
                        onClick={() => setIsCompletedGoalsExpanded(true)}
                        className='text-sm text-muted-foreground'
                      >
                        {
                          childrenData.flatMap((child) =>
                            child.goals.filter(
                              (goal) => goal.status === 'completed'
                            )
                          ).length
                        }{' '}
                        completed goals • Click to expand
                      </Button>
                    </div>
                  ) : (
                    <>
                      {childrenData.flatMap((child) =>
                        child.goals
                          .filter((goal) => goal.status === 'completed')
                          .map((goal) => (
                            <div
                              key={goal.id}
                              className='border-b pb-4 mb-4 last:border-0 last:mb-0 last:pb-0'
                            >
                              <div className='flex justify-between mb-2'>
                                <div>
                                  <p className='font-medium'>{goal.name}</p>
                                  <p className='text-xs text-muted-foreground'>
                                    Jar: {child.jarId}
                                  </p>
                                </div>
                                <div className='text-xs text-right'>
                                  <p className='text-green-600 font-medium'>
                                    Completed!
                                  </p>
                                  <p className='text-muted-foreground'>
                                    Target: {goal.target} sats
                                  </p>
                                </div>
                              </div>
                              <div className='space-y-1'>
                                <div className='flex justify-between text-xs'>
                                  <span>{goal.current} sats</span>
                                  <span>{goal.target} sats</span>
                                </div>
                                <Progress
                                  value={100}
                                  variant='gold'
                                  size='md'
                                  showPercentage={true}
                                  label={`${goal.current.toLocaleString()} / ${goal.target.toLocaleString()} sats`}
                                />
                              </div>
                            </div>
                          ))
                      )}
                      {!childrenData.some((child) =>
                        child.goals.some((goal) => goal.status === 'completed')
                      ) && (
                        <div className='text-center py-6 text-muted-foreground'>
                          No completed goals yet
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Savings Tab */}
            <TabsContent value='savings' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center'>
                    <User className='h-5 w-5 mr-2' />
                    View Child's Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {childrenData.length > 1 ? (
                      <Select
                        value={selectedChild}
                        onValueChange={setSelectedChild}
                      >
                        <SelectTrigger className='w-[180px]'>
                          <SelectValue placeholder='Select a child' />
                        </SelectTrigger>
                        <SelectContent>
                          {childrenData.map((child) => (
                            <SelectItem key={child.id} value={child.id}>
                              <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-xs'>
                                  {child.name.charAt(0)}
                                </div>
                                <span>{child.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className='flex items-center gap-2 mb-4'>
                        <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center'>
                          {childrenData[0]?.name.charAt(0)}
                        </div>
                        <span className='font-medium'>
                          {childrenData[0]?.name}
                        </span>
                      </div>
                    )}
                    {selectedChildData && (
                      <>
                        <div className='bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 flex justify-between'>
                          <div>
                            <p className='text-sm text-muted-foreground'>
                              Current Balance
                            </p>
                            <p className='text-2xl font-bold'>
                              {selectedChildData.balance} sats
                            </p>
                            <p className='text-xs text-muted-foreground mt-1'>
                              ≈ KES{' '}
                              {(selectedChildData.balance * 0.03).toFixed(2)}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm text-muted-foreground'>
                              Goals Progress
                            </p>
                            <p className='text-2xl font-bold'>
                              {selectedChildData.goals.length > 0
                                ? `${Math.round(
                                    selectedChildData.goals.reduce(
                                      (acc, goal) =>
                                        acc +
                                        (goal.current / goal.target) * 100,
                                      0
                                    ) / selectedChildData.goals.length
                                  )}%`
                                : 'No goals'}
                            </p>
                          </div>
                        </div>
                        <Tabs value={savingsTab} onValueChange={setSavingsTab}>
                          <TabsList className='grid grid-cols-4 mb-4'>
                            <TabsTrigger value='auto'>Auto Plans</TabsTrigger>
                            <TabsTrigger value='goals'>
                              Savings Goals
                            </TabsTrigger>
                            <TabsTrigger value='history'>History</TabsTrigger>
                            <TabsTrigger value='summary'>Summary</TabsTrigger>
                          </TabsList>
                          <TabsContent value='auto'>
                            <SavingsPlans
                              childId={selectedChildData.id}
                              onSuccess={() => {
                                // Refresh child data after successful plan creation
                                fetchChildrenData();
                              }}
                            />
                          </TabsContent>
                          <TabsContent value='goals'>
                            <div className='bg-amber-50 dark:bg-amber-900/10 p-3 rounded-md flex items-center gap-3 mb-4'>
                              <Info className='h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0' />
                              <p className='text-sm text-amber-700 dark:text-amber-300'>
                                Goals are targets you want to save for, like a
                                new bike or game. Set a target amount and track
                                progress.
                              </p>
                            </div>
                            {selectedChildData.goals.length > 0 ? (
                              <div className='space-y-4'>
                                {selectedChildData.goals.map((goal) => (
                                  <div
                                    key={goal.id}
                                    className='border border-gray-200 dark:border-gray-800 p-3 rounded-lg'
                                  >
                                    <div className='flex justify-between mb-2'>
                                      <p className='font-medium'>{goal.name}</p>
                                      <p className='text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800'>
                                        {goal.status === 'approved'
                                          ? 'Approved'
                                          : 'Pending'}
                                      </p>
                                    </div>
                                    <div className='space-y-1'>
                                      <div className='flex justify-between text-xs'>
                                        <span>{goal.current} sats</span>
                                        <span>{goal.target} sats</span>
                                      </div>
                                      <Progress
                                        value={
                                          (goal.current / goal.target) * 100
                                        }
                                        variant='amber'
                                        size='md'
                                        showPercentage={true}
                                        showMarkers={true}
                                        label={`${goal.current.toLocaleString()} / ${goal.target.toLocaleString()} sats`}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className='text-center py-8 text-muted-foreground'>
                                No savings goals set up yet
                              </div>
                            )}
                          </TabsContent>
                          <TabsContent value='history'>
                            <div className='flex justify-between mb-4'>
                              <h4 className='text-sm font-medium'>
                                Transaction History
                              </h4>
                              <div className='flex gap-1'>
                                <Button
                                  variant={
                                    timeframe === 'week' ? 'default' : 'outline'
                                  }
                                  size='sm'
                                  onClick={() => setTimeframe('week')}
                                >
                                  Week
                                </Button>
                                <Button
                                  variant={
                                    timeframe === 'month'
                                      ? 'default'
                                      : 'outline'
                                  }
                                  size='sm'
                                  onClick={() => setTimeframe('month')}
                                >
                                  Month
                                </Button>
                                <Button
                                  variant={
                                    timeframe === 'year' ? 'default' : 'outline'
                                  }
                                  size='sm'
                                  onClick={() => setTimeframe('year')}
                                >
                                  Year
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={fetchChildrenData}
                                  disabled={isLoadingData}
                                  title='Refresh transaction history'
                                >
                                  <RefreshCcw
                                    className={`h-4 w-4 ${
                                      isLoadingData ? 'animate-spin' : ''
                                    }`}
                                  />
                                </Button>
                              </div>
                            </div>
                            <div className='space-y-2'>
                              {isLoadingData ? (
                                <div className='text-center py-8'>
                                  <div className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2'></div>
                                  <p className='text-sm text-muted-foreground'>
                                    Loading transactions...
                                  </p>
                                </div>
                              ) : recentTransactions.length === 0 ? (
                                <div className='text-center py-8 text-muted-foreground'>
                                  <History className='h-12 w-12 mx-auto mb-4 opacity-50' />
                                  <p className='font-medium'>
                                    No transactions found
                                  </p>
                                  <p className='text-xs mt-1'>
                                    Transactions will appear here when{' '}
                                    {selectedChildData.name} makes deposits or
                                    withdrawals
                                  </p>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='mt-3'
                                    onClick={() =>
                                      handleAddFunds(selectedChildData.id)
                                    }
                                  >
                                    <Plus className='h-4 w-4 mr-1' />
                                    Add First Transaction
                                  </Button>
                                </div>
                              ) : (
                                recentTransactions
                                  .filter((tx) => {
                                    // Filter by child name or ID
                                    const matchesChild =
                                      tx.childName === selectedChildData.name ||
                                      tx.childId === selectedChildData.id;

                                    // Filter by timeframe
                                    const txDate = new Date(
                                      tx.date || tx.timestamp || tx.createdAt
                                    );
                                    const now = new Date();
                                    const timeDiff =
                                      now.getTime() - txDate.getTime();

                                    switch (timeframe) {
                                      case 'week':
                                        return (
                                          matchesChild &&
                                          timeDiff <= 7 * 24 * 60 * 60 * 1000
                                        );
                                      case 'month':
                                        return (
                                          matchesChild &&
                                          timeDiff <= 30 * 24 * 60 * 60 * 1000
                                        );
                                      case 'year':
                                        return (
                                          matchesChild &&
                                          timeDiff <= 365 * 24 * 60 * 60 * 1000
                                        );
                                      default:
                                        return matchesChild;
                                    }
                                  })
                                  .sort((a, b) => {
                                    // Sort by date, newest first
                                    const dateA = new Date(
                                      a.date || a.timestamp || a.createdAt
                                    );
                                    const dateB = new Date(
                                      b.date || b.timestamp || b.createdAt
                                    );
                                    return dateB.getTime() - dateA.getTime();
                                  })
                                  .map((tx, index) => (
                                    <div
                                      key={tx.id || `tx-${index}`}
                                      className='flex items-center justify-between py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
                                    >
                                      <div className='flex items-center gap-3'>
                                        <div
                                          className={`p-2 rounded-full ${
                                            tx.type === 'deposit' ||
                                            tx.amount > 0
                                              ? 'bg-green-100 dark:bg-green-900/30'
                                              : 'bg-red-100 dark:bg-red-900/30'
                                          }`}
                                        >
                                          {tx.type === 'deposit' ||
                                          tx.amount > 0 ? (
                                            <Plus className='h-4 w-4 text-green-600 dark:text-green-400' />
                                          ) : (
                                            <History className='h-4 w-4 text-red-600 dark:text-red-400' />
                                          )}
                                        </div>
                                        <div>
                                          <p className='font-medium capitalize'>
                                            {tx.type ||
                                              (tx.amount > 0
                                                ? 'Deposit'
                                                : 'Withdrawal')}
                                          </p>
                                          <p className='text-xs text-muted-foreground'>
                                            {new Date(
                                              tx.date ||
                                                tx.timestamp ||
                                                tx.createdAt
                                            ).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            })}
                                          </p>
                                          {tx.description && (
                                            <p className='text-xs text-muted-foreground mt-1'>
                                              {tx.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className='text-right'>
                                        <span
                                          className={`font-bold ${
                                            tx.amount > 0
                                              ? 'text-green-600 dark:text-green-400'
                                              : 'text-red-600 dark:text-red-400'
                                          }`}
                                        >
                                          {tx.amount > 0 ? '+' : ''}
                                          {Math.abs(
                                            tx.amount
                                          ).toLocaleString()}{' '}
                                          sats
                                        </span>
                                        {tx.status && (
                                          <p className='text-xs text-muted-foreground mt-1 capitalize'>
                                            {tx.status}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))
                              )}
                            </div>
                          </TabsContent>
                          <TabsContent value='summary'>
                            <div className='space-y-6'>
                              {/* Summary Header with Refresh */}
                              <div className='flex items-center justify-between'>
                                <div>
                                  <h3 className='text-lg font-semibold flex items-center'>
                                    <PiggyBank className='h-5 w-5 mr-2 text-blue-600 dark:text-blue-400' />
                                    {selectedChildData.name}'s Savings Summary
                                  </h3>
                                  <p className='text-sm text-muted-foreground'>
                                    Track savings progress and achievements
                                  </p>
                                </div>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={fetchChildrenData}
                                  disabled={isLoadingData}
                                  className='flex items-center gap-2'
                                  title='Refresh savings data'
                                >
                                  <RefreshCcw
                                    className={`h-4 w-4 ${
                                      isLoadingData ? 'animate-spin' : ''
                                    }`}
                                  />
                                  Refresh
                                </Button>
                              </div>

                              {/* Enhanced Stats Grid */}
                              <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                                {/* Total Saved */}
                                <div className='bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-5 rounded-xl border border-blue-200/50 dark:border-blue-700/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'>
                                  <div className='flex items-center justify-between mb-2'>
                                    <Coins className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                                    <div className='bg-blue-600 dark:bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>
                                      Balance
                                    </div>
                                  </div>
                                  <h3 className='text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1'>
                                    Total Saved
                                  </h3>
                                  <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                                    {selectedChildData.balance.toLocaleString()}
                                  </p>
                                  <p className='text-xs text-blue-600 dark:text-blue-400 mt-1'>
                                    sats in jar
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
                                    {
                                      selectedChildData.goals.filter(
                                        (g) => g.status === 'approved'
                                      ).length
                                    }
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
                                    {
                                      selectedChildData.goals.filter(
                                        (g) => g.status === 'completed'
                                      ).length
                                    }
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
                                    {
                                      selectedChildData.goals.filter(
                                        (g) =>
                                          g.status === 'pending' ||
                                          g.deletionRequested === true
                                      ).length
                                    }
                                  </p>
                                  <p className='text-xs text-purple-600 dark:text-purple-400 mt-1'>
                                    awaiting approval
                                  </p>
                                </div>
                              </div>

                              {/* Enhanced Goal Progress Section */}
                              {selectedChildData.goals.length > 0 ? (
                                <div className='bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-700/50 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/30'>
                                  <div className='flex items-center justify-between mb-4'>
                                    <h3 className='text-lg font-semibold flex items-center'>
                                      <TrendingUp className='h-5 w-5 mr-2 text-blue-600 dark:text-blue-400' />
                                      {selectedChildData.name}'s Goal Progress
                                    </h3>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={() =>
                                        handleViewChildDashboard(
                                          selectedChildData.id
                                        )
                                      }
                                      className='text-xs'
                                    >
                                      View Dashboard
                                    </Button>
                                  </div>
                                  <div className='space-y-4'>
                                    {selectedChildData.goals.map((goal) => {
                                      const progress =
                                        (goal.current / goal.target) * 100;
                                      const remaining =
                                        goal.target - goal.current;
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
                                                {goal.current.toLocaleString()}{' '}
                                                / {goal.target.toLocaleString()}{' '}
                                                sats
                                              </p>
                                            </div>
                                            <div className='text-right'>
                                              <div className='text-lg font-bold text-blue-600 dark:text-blue-400'>
                                                {Math.round(progress)}%
                                              </div>
                                              <div className='text-xs text-gray-500 dark:text-gray-400'>
                                                {remaining.toLocaleString()}{' '}
                                                left
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
                                                : 'Pending Approval'}
                                            </span>
                                            {goal.status === 'pending' && (
                                              <Button
                                                variant='outline'
                                                size='sm'
                                                className='text-xs h-7'
                                              >
                                                Review Goal
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
                                    No Goals Yet
                                  </h3>
                                  <p className='text-blue-700 dark:text-blue-300 mb-4'>
                                    Encourage {selectedChildData.name} to create
                                    their first savings goal
                                  </p>
                                  <Button
                                    onClick={() =>
                                      handleViewChildDashboard(
                                        selectedChildData.id
                                      )
                                    }
                                    className='bg-blue-600 hover:bg-blue-700 text-white'
                                  >
                                    <Star className='h-4 w-4 mr-2' />
                                    Help Create Goal
                                  </Button>
                                </div>
                              )}

                              {/* Enhanced Savings Insights */}
                              <div className='bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-200/50 dark:border-amber-700/30'>
                                <div className='flex items-center mb-4'>
                                  <div className='bg-amber-500 p-2 rounded-lg mr-3'>
                                    <Award className='h-5 w-5 text-white' />
                                  </div>
                                  <div>
                                    <h3 className='font-semibold text-amber-900 dark:text-amber-100'>
                                      Parental Insights
                                    </h3>
                                    <p className='text-sm text-amber-700 dark:text-amber-300'>
                                      {selectedChildData.name}'s savings
                                      performance
                                    </p>
                                  </div>
                                </div>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                  <div className='bg-white/70 dark:bg-slate-800/70 p-4 rounded-lg'>
                                    <div className='flex items-center justify-between'>
                                      <span className='text-sm font-medium text-amber-800 dark:text-amber-200'>
                                        Savings Activity
                                      </span>
                                      <TrendingUp className='h-4 w-4 text-green-600 dark:text-green-400' />
                                    </div>
                                    <p className='text-lg font-bold text-amber-900 dark:text-amber-100'>
                                      {selectedChildData.balance > 0
                                        ? 'Active Saver'
                                        : 'Getting Started'}
                                    </p>
                                    <p className='text-xs text-amber-700 dark:text-amber-300'>
                                      {selectedChildData.balance.toLocaleString()}{' '}
                                      sats saved
                                    </p>
                                  </div>
                                  <div className='bg-white/70 dark:bg-slate-800/70 p-4 rounded-lg'>
                                    <div className='flex items-center justify-between'>
                                      <span className='text-sm font-medium text-amber-800 dark:text-amber-200'>
                                        Goal Setting
                                      </span>
                                      <Trophy className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                                    </div>
                                    <p className='text-lg font-bold text-amber-900 dark:text-amber-100'>
                                      {selectedChildData.goals.length > 0
                                        ? 'Goal Oriented'
                                        : 'Needs Goals'}
                                    </p>
                                    <p className='text-xs text-amber-700 dark:text-amber-300'>
                                      {selectedChildData.goals.length} total
                                      goals
                                    </p>
                                  </div>
                                </div>
                                <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                                  <p className='text-sm text-blue-700 dark:text-blue-300'>
                                    💡 <strong>Tip:</strong>{' '}
                                    {selectedChildData.balance > 0
                                      ? selectedChildData.goals.length > 0
                                        ? 'Consider setting up automatic savings plans to help reach goals faster!'
                                        : 'Help your child create specific savings goals to stay motivated!'
                                      : 'Encourage regular small deposits to build a savings habit!'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Learning Tab */}
            <TabsContent value='learning' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center'>
                    <Book className='h-5 w-5 mr-2' />
                    Family Learning Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <Card className='bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-0 shadow-md'>
                      <CardContent className='p-4'>
                        <h3 className='font-bold mb-1'>Bitcoin Basics</h3>
                        <p className='text-sm text-muted-foreground mb-3'>
                          Learn the fundamentals of Bitcoin with your family
                        </p>
                        <Button
                          size='sm'
                          className='w-full'
                          onClick={() => window.open('/BITCOIN .pdf', '_blank')}
                        >
                          Start Learning
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className='bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-0 shadow-md'>
                      <CardContent className='p-4'>
                        <h3 className='font-bold mb-1'>Sats Jar Platform</h3>
                        <p className='text-sm text-muted-foreground mb-3'>
                          World's first Bitcoin savings, learning & earning
                          platform for kids
                        </p>
                        <Button
                          size='sm'
                          className='w-full'
                          onClick={() => navigate('/about')}
                        >
                          Learn More
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className='bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-0 shadow-md'>
                      <CardContent className='p-4'>
                        <h3 className='font-bold mb-1'>Savings Strategies</h3>
                        <p className='text-sm text-muted-foreground mb-3'>
                          Tips to help your children save effectively
                        </p>
                        <Button
                          size='sm'
                          className='w-full'
                          onClick={() =>
                            window.open(
                              'https://www.practicalmoneyskills.com/learn/articles/saving_and_investing/saving_strategies_for_kids',
                              '_blank'
                            )
                          }
                        >
                          Learn More
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className='bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-0 shadow-md'>
                      <CardContent className='p-4'>
                        <h3 className='font-bold mb-1'>Bitcoin Education</h3>
                        <p className='text-sm text-muted-foreground mb-3'>
                          Interactive Bitcoin learning for children and families
                        </p>
                        <Button
                          size='sm'
                          className='w-full'
                          onClick={() =>
                            window.open(
                              'https://thebitcoinkids.com/#:~:text=We%20are%20the%20Bitcoin%20Kids&text=As%20a%20passionate%20advocate%20for,from%20the%20traditional%20financial%20system.',
                              '_blank'
                            )
                          }
                        >
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value='achievements' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center'>
                    <Award className='h-5 w-5 mr-2' />
                    Children's Achievements
                  </CardTitle>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Real achievements earned by your children through savings
                    and learning
                  </p>
                </CardHeader>
                <CardContent>
                  {childrenData.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      <Award className='h-12 w-12 mx-auto mb-4 opacity-50' />
                      <p>No children added yet.</p>
                      <Button
                        variant='outline'
                        size='sm'
                        className='mt-2'
                        onClick={() => setShowManageChildren(true)}
                      >
                        Add Children
                      </Button>
                    </div>
                  ) : (
                    <div className='space-y-6'>
                      {childrenData.map((child) => {
                        const badges = generateAchievementBadges(child);
                        const earnedCount = badges.filter(
                          (b) => b.earned
                        ).length;

                        return (
                          <div
                            key={child.id}
                            className='border-b pb-6 last:border-0 last:pb-0'
                          >
                            <div className='flex items-center justify-between mb-4'>
                              <div className='flex items-center'>
                                <div className='h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold mr-3'>
                                  {child.name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className='font-medium'>{child.name}</h3>
                                  <p className='text-xs text-muted-foreground'>
                                    {earnedCount} achievement
                                    {earnedCount !== 1 ? 's' : ''} earned
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  handleViewChildDashboard(child.id)
                                }
                                className='text-xs'
                              >
                                View Details
                              </Button>
                            </div>

                            <div className='grid grid-cols-3 sm:grid-cols-5 gap-4'>
                              {badges.map((badge, index) => (
                                <div
                                  key={badge.id}
                                  className={`flex flex-col items-center ${
                                    !badge.earned ? 'opacity-40' : ''
                                  }`}
                                >
                                  <div
                                    className={`h-12 w-12 rounded-full bg-gradient-to-br ${
                                      badge.earned
                                        ? badge.gradient
                                        : 'from-gray-300 to-gray-400'
                                    } flex items-center justify-center mb-2 relative`}
                                  >
                                    {badge.icon}
                                    {badge.earned && (
                                      <div className='absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center'>
                                        <CheckCircle2 className='h-3 w-3 text-white' />
                                      </div>
                                    )}
                                  </div>
                                  <span className='text-xs text-center font-medium'>
                                    {badge.name}
                                  </span>
                                  <span className='text-xs text-center text-muted-foreground'>
                                    {badge.description}
                                  </span>
                                  {badge.earned && badge.earnedDate && (
                                    <span className='text-xs text-center text-green-600 mt-1'>
                                      {new Date(
                                        badge.earnedDate.seconds * 1000
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>

                            {earnedCount === 0 && (
                              <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                                <p className='text-sm text-blue-700 dark:text-blue-300'>
                                  🎯 Encourage {child.name} to start saving or
                                  complete learning modules to earn their first
                                  achievements!
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add Funds Modal */}
          <AddFundsModal
            open={fundChildModal.open}
            onOpenChange={(open) => {
              setFundChildModal({
                open,
                childId: open ? fundChildModal.childId : '',
                childName: open ? fundChildModal.childName : '',
              });
            }}
            childName={fundChildModal.childName}
            childId={fundChildModal.childId}
            onSuccess={() => {
              fetchChildrenData();
            }}
          />

          {/* Bottom Navigation - Mobile Only */}
          <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t py-2 px-4 z-10'>
            <div className='flex justify-around max-w-md mx-auto'>
              <Button
                variant='ghost'
                className='flex flex-col items-center h-auto py-1'
                onClick={() => setActiveTab('overview')}
              >
                <div
                  className={`p-1 rounded-full ${
                    activeTab === 'overview' ? 'bg-primary/10' : ''
                  }`}
                >
                  <Home
                    className={`h-5 w-5 ${
                      activeTab === 'overview'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs ${
                    activeTab === 'overview'
                      ? 'text-primary font-medium'
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
                <div
                  className={`p-1 rounded-full ${
                    activeTab === 'savings' ? 'bg-primary/10' : ''
                  }`}
                >
                  <Coins
                    className={`h-5 w-5 ${
                      activeTab === 'savings'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs ${
                    activeTab === 'savings'
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  Savings
                </span>
              </Button>
              <Button
                variant='ghost'
                className='flex flex-col items-center h-auto py-1'
                onClick={() => setShowManageChildren(true)}
              >
                <div
                  className={`p-1 rounded-full ${
                    showManageChildren ? 'bg-primary/10' : ''
                  }`}
                >
                  <User
                    className={`h-5 w-5 ${
                      showManageChildren
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs ${
                    showManageChildren
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  Children
                </span>
              </Button>
              <Button
                variant='ghost'
                className='flex flex-col items-center h-auto py-1'
                onClick={() => {
                  toast({
                    title: 'Settings',
                    description: 'Settings page coming soon!',
                  });
                }}
              >
                <div className='p-1 rounded-full'>
                  <Settings className='h-5 w-5 text-muted-foreground' />
                </div>
                <span className='text-xs text-muted-foreground'>Settings</span>
              </Button>
              <Button
                variant='ghost'
                className='flex flex-col items-center h-auto py-1'
                onClick={logout}
              >
                <div className='p-1 rounded-full'>
                  <LogOut className='h-5 w-5 text-muted-foreground' />
                </div>
                <span className='text-xs text-muted-foreground'>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </DesktopContentLayout>
    </ResponsiveLayout>
  );
};

export default ParentDashboard;
