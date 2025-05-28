import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ChildDashboard from '@/components/ChildDashboard';
import { childrenApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  LoadingWrapper,
  ChildDashboardSkeleton,
  usePerformanceMonitor,
} from '@/components/LoadingOptimization';
import { Home, Coins, Users, Settings, LogOut } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import AddFundsModal from '@/components/AddFundsModal';

// Define types
interface Child {
  id: string;
  jarId: string;
  name: string;
  balance: number;
  goals?: any[];
}

const ChildDashboardPage = () => {
  const { childId } = useParams<{ childId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startTimer } = usePerformanceMonitor();

  // Get child data from location state or fetch it
  const [childData, setChildData] = useState<Child | null>(
    location.state?.childData || null
  );
  const [isLoading, setIsLoading] = useState(!location.state?.childData);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [childSavingsData, setChildSavingsData] = useState<any[]>([]);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'lightning' | 'mpesa'
  >('lightning');

  // Fetch all children data for the parent
  useEffect(() => {
    const fetchAllChildren = async () => {
      try {
        const response = await childrenApi.getChildren();
        if (response && response.children) {
          setAllChildren(response.children);

          // Generate sample savings data based on actual children
          generateSampleSavingsData(response.children);
        }
      } catch (error) {
        console.error('Failed to fetch children:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load children data',
        });
      }
    };

    fetchAllChildren();
  }, []);

  // Generate sample savings data based on children
  const generateSampleSavingsData = (children: Child[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const sampleData = [];

    for (let i = 0; i < months.length; i++) {
      const monthData: any = { month: months[i] };

      children.forEach((child) => {
        // Generate some random increasing values for each child
        const baseValue = 100 + Math.floor(Math.random() * 100);
        monthData[child.name] =
          baseValue + i * 50 + Math.floor(Math.random() * 30);
      });

      sampleData.push(monthData);
    }

    setChildSavingsData(sampleData);
  };

  useEffect(() => {
    if (!childData && childId) {
      // Fetch child data if not available in location state
      setIsLoading(true);

      const fetchChildData = async () => {
        try {
          const response = await childrenApi.getChildDetails(childId);
          setChildData(response);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to fetch child details:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load child data',
          });
          setIsLoading(false);
        }
      };

      fetchChildData();
    }
  }, [childId, childData]);

  const handleBackToParentDashboard = () => {
    navigate('/');
  };

  const handleShowManageChildren = () => {
    navigate('/');
  };

  const handleShowSettings = () => {
    navigate('/parental-controls');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleShowLightning = () => {
    setSelectedPaymentMethod('lightning');
    setShowAddFundsModal(true);
  };

  const handleShowMpesa = () => {
    setSelectedPaymentMethod('mpesa');
    setShowAddFundsModal(true);
  };

  const handleShowGoals = () => {
    navigate(`/child-dashboard/${childId}/goals`);
  };

  const handleShowLearning = () => {
    navigate(`/child-dashboard/${childId}/learning`);
  };

  const handleShowHistory = () => {
    navigate(`/child-dashboard/${childId}/history`);
  };

  const handleShowAchievements = () => {
    navigate(`/child-dashboard/${childId}/achievements`);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='h-8 w-8 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full'></div>
          <p>Loading child dashboard...</p>
        </div>
      </div>
    );
  }

  if (!childData) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-4'>
        <div className='text-center mb-4'>
          <p className='text-lg font-semibold'>Child not found</p>
          <p className='text-muted-foreground'>
            The requested child dashboard could not be loaded
          </p>
        </div>
        <Button onClick={handleBackToParentDashboard}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className='max-w-md mx-auto lg:max-w-4xl xl:max-w-6xl pb-16'>
      {/* Back button - positioned to avoid sidebar overlap */}
      <div className='mb-4 p-4 lg:pl-6 xl:pl-8'>
        <Button
          variant='ghost'
          onClick={handleBackToParentDashboard}
          className='flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          <span className='font-medium'>Back to Dashboard</span>
        </Button>
      </div>

      <ChildDashboard
        childData={childData}
        onShowLightning={handleShowLightning}
        onShowMpesa={handleShowMpesa}
        onShowLearning={handleShowLearning}
        onShowGoals={handleShowGoals}
        onShowHistory={handleShowHistory}
        onShowAchievements={handleShowAchievements}
        isParentView={true}
        hideBottomNav={true} // Hide the child's bottom nav
      />

      {/* Parent Bottom Navigation */}
      <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t py-2 px-4 z-10'>
        <div className='flex justify-around max-w-md mx-auto lg:max-w-4xl xl:max-w-6xl'>
          <Button
            variant='ghost'
            className='flex flex-col items-center h-auto py-1'
            onClick={handleBackToParentDashboard}
          >
            <div className='p-1 rounded-full bg-primary/10'>
              <Home className='h-5 w-5 text-primary' />
            </div>
            <span className='text-xs text-primary font-medium'>Home</span>
          </Button>

          <Button
            variant='ghost'
            className='flex flex-col items-center h-auto py-1'
            onClick={() => {
              toast({
                title: 'Savings',
                description: 'Viewing parent savings dashboard',
              });
              navigate('/');
            }}
          >
            <div className='p-1 rounded-full'>
              <Coins className='h-5 w-5 text-muted-foreground' />
            </div>
            <span className='text-xs text-muted-foreground'>Savings</span>
          </Button>

          <Button
            variant='ghost'
            className='flex flex-col items-center h-auto py-1'
            onClick={handleShowManageChildren}
          >
            <div className='p-1 rounded-full'>
              <Users className='h-5 w-5 text-muted-foreground' />
            </div>
            <span className='text-xs text-muted-foreground'>Children</span>
          </Button>

          <Button
            variant='ghost'
            className='flex flex-col items-center h-auto py-1'
            onClick={handleShowSettings}
          >
            <div className='p-1 rounded-full'>
              <Settings className='h-5 w-5 text-muted-foreground' />
            </div>
            <span className='text-xs text-muted-foreground'>Settings</span>
          </Button>

          <Button
            variant='ghost'
            className='flex flex-col items-center h-auto py-1'
            onClick={handleLogout}
          >
            <div className='p-1 rounded-full'>
              <LogOut className='h-5 w-5 text-muted-foreground' />
            </div>
            <span className='text-xs text-muted-foreground'>Logout</span>
          </Button>
        </div>
      </div>
      <AddFundsModal
        open={showAddFundsModal}
        onOpenChange={setShowAddFundsModal}
        childId={childId}
        childName={childData?.name}
        initialPaymentMethod={selectedPaymentMethod}
        onSuccess={() => {
          // Refresh child data after successful payment
          if (childId) {
            const fetchChildData = async () => {
              try {
                const response = await childrenApi.getChildDetails(childId);
                setChildData(response);
              } catch (error) {
                console.error('Failed to fetch child details:', error);
              }
            };
            fetchChildData();
          }
        }}
      />
    </div>
  );
};

export default ChildDashboardPage;
