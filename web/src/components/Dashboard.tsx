
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Wallet, Zap, History, LogOut, PiggyBank, Book, Award, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/UserAuthContext';

interface DashboardProps {
  balance: number;
  onRefreshBalance: () => void;
  onShowLightning: () => void;
  onShowMpesa: () => void;
  onShowHistory: () => void;
  onLogout: () => void;
  onShowGoals?: () => void;
  onShowAchievements?: () => void;
  onShowLearning?: () => void;
  isLoadingBalance: boolean;
}

const Dashboard = ({
  balance,
  onRefreshBalance,
  onShowLightning,
  onShowMpesa,
  onShowHistory,
  onLogout,
  onShowGoals,
  onShowAchievements,
  onShowLearning,
  isLoadingBalance
}: DashboardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isParent = user?.role === 'parent';
  
  const handleRefreshClick = () => {
    onRefreshBalance();
    toast({
      title: "Refreshing balance",
      description: "Your balance is being updated...",
    });
  };
  
  // Mock goal data
  const currentGoal = {
    name: "New Toy",
    target: 1000,
    current: Math.min(balance, 1000)
  };
  
  const progressPercentage = (currentGoal.current / currentGoal.target) * 100;
  
  return (
    <div className="space-y-6 p-4">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {isParent ? "Parent Dashboard" : "My Savings Jar"}
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={handleRefreshClick}
              disabled={isLoadingBalance}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          
          <div className="mt-6">
            <p className="text-sm font-medium text-white/70">Available Savings</p>
            <div className="flex items-baseline mt-1">
              {isLoadingBalance ? (
                <div className="flex items-center gap-2">
                  <span className="loading"></span>
                  <span className="text-white/90 text-lg">Updating...</span>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">{balance.toLocaleString()}</h1>
                  <span className="text-lg ml-2 text-white/90">sats</span>
                </>
              )}
            </div>
            
            {/* Goal progress indicator */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/80 mb-1">
                <span>Goal Progress: {currentGoal.name}</span>
                <span>{currentGoal.current} / {currentGoal.target} sats</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-white/20" />
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          {isParent ? (
            // Parent action buttons
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button 
                className="bg-mpesa hover:bg-mpesa/90 text-white"
                onClick={onShowMpesa}
              >
                <PiggyBank className="mr-2 h-4 w-4" />
                Deposit / Withdraw
              </Button>
              <Button 
                className="bg-lightning hover:bg-lightning/90"
                onClick={onShowLightning}
              >
                <Zap className="mr-2 h-4 w-4" />
                Bitcoin Payment
              </Button>
              <Button 
                variant="outline"
                className="border-amber-500 text-amber-600 hover:bg-amber-50"
                onClick={onShowHistory}
              >
                <History className="mr-2 h-4 w-4" />
                Transaction History
              </Button>
            </div>
          ) : (
            // Child action buttons
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {onShowGoals && (
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={onShowGoals}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Set Goals
                </Button>
              )}
              {onShowLearning && (
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={onShowLearning}
                >
                  <Book className="mr-2 h-4 w-4" />
                  Learn & Earn
                </Button>
              )}
              {onShowAchievements && (
                <Button 
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={onShowAchievements}
                >
                  <Award className="mr-2 h-4 w-4" />
                  Achievements
                </Button>
              )}
              <Button 
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={onShowHistory}
              >
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent activity section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-2">
            <li className="p-2 bg-gray-50 rounded-md flex justify-between items-center">
              <div>
                <p className="font-medium">Deposit</p>
                <p className="text-xs text-muted-foreground">10 May 2023</p>
              </div>
              <span className="text-emerald-600 font-semibold">+50 sats</span>
            </li>
            <li className="p-2 bg-gray-50 rounded-md flex justify-between items-center">
              <div>
                <p className="font-medium">Quiz Completed</p>
                <p className="text-xs text-muted-foreground">8 May 2023</p>
              </div>
              <span className="text-emerald-600 font-semibold">+10 sats</span>
            </li>
            <li className="p-2 bg-gray-50 rounded-md flex justify-between items-center">
              <div>
                <p className="font-medium">Goal Created</p>
                <p className="text-xs text-muted-foreground">5 May 2023</p>
              </div>
              <span className="text-blue-600 font-semibold">New Toy (1000 sats)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          className="text-destructive hover:text-destructive" 
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
