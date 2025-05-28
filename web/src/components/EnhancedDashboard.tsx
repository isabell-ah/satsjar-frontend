
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Wallet, Zap, History, LogOut, PiggyBank, Book, Award, Star, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/UserAuthContext';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

// Sample savings data for the chart
const savingsData = [
  { month: 'Jan', amount: 200 },
  { month: 'Feb', amount: 350 },
  { month: 'Mar', amount: 450 },
  { month: 'Apr', amount: 520 },
  { month: 'May', amount: 700 },
  { month: 'Jun', amount: 850 },
];

interface EnhancedDashboardProps {
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

const EnhancedDashboard = ({
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
}: EnhancedDashboardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isParent = user?.role === 'parent';
  
  const [exchangeRate, setExchangeRate] = useState(0.03); // Sample rate: 1 sat = 0.03 KES
  const kesAmount = balance * exchangeRate;
  
  // Mock goal data with multiple goals
  const goals = [
    {
      id: "1",
      name: "New Toy",
      target: 1000,
      current: Math.min(balance * 0.4, 1000),
      approved: true
    },
    {
      id: "2",
      name: "School Books",
      target: 800,
      current: Math.min(balance * 0.3, 800),
      approved: true
    },
    {
      id: "3",
      name: "Bicycle",
      target: 5000,
      current: Math.min(balance * 0.2, 5000),
      approved: false
    }
  ];
  
  const handleRefreshClick = () => {
    onRefreshBalance();
    toast({
      title: "Refreshing balance",
      description: "Your balance is being updated...",
    });
  };
  
  const handleApproveGoal = (goalId: string) => {
    toast({
      title: "Goal Approved",
      description: "The savings goal has been approved.",
    });
  };
  
  return (
    <div className="space-y-6 p-4">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {isParent ? "Family Dashboard" : "My Savings Jar"}
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
            <p className="text-sm font-medium text-white/70">Available Balance</p>
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
            <div className="mt-1 text-white/80 text-sm">
              ≈ KES {kesAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            
            {/* Goal progress indicator for primary goal */}
            {goals.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-white/80 mb-1">
                  <span>Primary Goal: {goals[0].name}</span>
                  <span>{goals[0].current} / {goals[0].target} sats</span>
                </div>
                <Progress 
                  value={(goals[0].current / goals[0].target) * 100} 
                  className="h-2 bg-white/20" 
                />
              </div>
            )}
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
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={onShowGoals}
              >
                <Star className="mr-2 h-4 w-4" />
                Manage Goals
              </Button>
              <Link to="/parental-controls" className="col-span-1">
                <Button
                  variant="outline"
                  className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Parental Controls
                </Button>
              </Link>
            </div>
          ) : (
            // Child action buttons
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {onShowGoals && (
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-white animate-pulse"
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
      
      {/* Parent-specific savings chart */}
      {isParent && (
        <Card>
          <CardHeader>
            <CardTitle>Savings Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Multiple goals section for parents */}
      {isParent && (
        <Card>
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{goal.name}</h4>
                    <div className="text-sm text-muted-foreground">
                      {goal.current} / {goal.target} sats
                    </div>
                  </div>
                  {!goal.approved && (
                    <Button 
                      size="sm" 
                      onClick={() => handleApproveGoal(goal.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Approve
                    </Button>
                  )}
                </div>
                <Progress 
                  value={(goal.current / goal.target) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
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

export default EnhancedDashboard;
