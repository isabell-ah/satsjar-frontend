import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Coins,
  Calendar,
  Award,
  RefreshCcw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';
import { transactionsApi } from '@/services/api';

interface ChildGrowthChartProps {
  balance: number;
  goals: any[];
  achievements: any[];
  childId?: string;
}

const ChildGrowthChart = ({
  balance,
  goals,
  achievements,
  childId,
}: ChildGrowthChartProps) => {
  const [chartType, setChartType] = useState<
    'savings' | 'goals' | 'achievements'
  >('savings');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months'>(
    'month'
  );
  const [savingsData, setSavingsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate realistic savings growth data based on actual balance
  const generateSavingsData = () => {
    const now = new Date();
    const data = [];

    const periods = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const interval = timeRange === 'week' ? 1 : timeRange === 'month' ? 1 : 3;

    // Calculate realistic growth progression leading to current balance
    const totalPoints = Math.ceil(periods / interval) + 1;
    const growthPerPoint = balance / totalPoints; // Gradual growth to current balance

    for (let i = periods; i >= 0; i -= interval) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Calculate realistic amount that grows to current balance
      const pointIndex = Math.ceil((periods - i) / interval);
      const baseAmount = Math.max(0, Math.round(pointIndex * growthPerPoint));

      // Add small random variation (±1 sat) but keep realistic
      const variation = Math.random() * 2 - 1; // -1 to +1
      const finalAmount = Math.max(
        0,
        Math.min(balance, Math.round(baseAmount + variation))
      );

      data.push({
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: timeRange === 'week' ? 'numeric' : undefined,
        }),
        amount: finalAmount,
        deposits: Math.round(Math.random() * 2), // Smaller, more realistic deposits
        goals: Math.round(Math.random() * 1),
      });
    }

    // Ensure the last point matches current balance exactly
    if (data.length > 0) {
      data[data.length - 1].amount = balance;
    }

    return data.reverse();
  };

  // Generate goals progress data
  const generateGoalsData = () => {
    return goals.map((goal, index) => ({
      name:
        goal.name.length > 10 ? goal.name.substring(0, 10) + '...' : goal.name,
      progress: Math.round((goal.current / goal.target) * 100),
      current: goal.current,
      target: goal.target,
      color: ['#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][index % 5],
    }));
  };

  // Generate achievements data
  const generateAchievementsData = () => {
    const categories = ['Saving', 'Learning', 'Goals', 'Consistency'];
    return categories.map((category, index) => ({
      category,
      count:
        achievements.filter((a) => a.category === category.toLowerCase())
          .length || Math.floor(Math.random() * 5),
      color: ['#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'][index],
    }));
  };

  useEffect(() => {
    setSavingsData(generateSavingsData());
  }, [timeRange, balance]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // In a real app, fetch actual transaction data
      // const transactions = await transactionsApi.getTransactions();
      setSavingsData(generateSavingsData());
    } catch (error) {
      console.error('Error refreshing chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSavingsChart = () => (
    <ResponsiveContainer width='100%' height={200}>
      <AreaChart data={savingsData}>
        <defs>
          <linearGradient id='savingsGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#f59e0b' stopOpacity={0.3} />
            <stop offset='95%' stopColor='#f59e0b' stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
        <XAxis
          dataKey='date'
          fontSize={12}
          tick={{ fill: '#6b7280' }}
          label={{
            value:
              timeRange === 'week'
                ? 'Days'
                : timeRange === 'month'
                ? 'Date'
                : 'Time Period',
            position: 'insideBottom',
            offset: -5,
            style: { textAnchor: 'middle', fontSize: '11px', fill: '#6b7280' },
          }}
        />
        <YAxis
          fontSize={12}
          tick={{ fill: '#6b7280' }}
          label={{
            value: 'Balance (sats)',
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: '11px', fill: '#6b7280' },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: any, name: string) => [
            `${value} sats`,
            name === 'amount' ? 'Balance' : name,
          ]}
        />
        <Area
          type='monotone'
          dataKey='amount'
          stroke='#f59e0b'
          strokeWidth={2}
          fill='url(#savingsGradient)'
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderGoalsChart = () => (
    <ResponsiveContainer width='100%' height={200}>
      <BarChart data={generateGoalsData()} layout='horizontal'>
        <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
        <XAxis
          type='number'
          domain={[0, 100]}
          fontSize={12}
          label={{
            value: 'Progress (%)',
            position: 'insideBottom',
            offset: -5,
            style: { textAnchor: 'middle', fontSize: '11px', fill: '#6b7280' },
          }}
        />
        <YAxis
          type='category'
          dataKey='name'
          fontSize={12}
          width={80}
          label={{
            value: 'Goals',
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: '11px', fill: '#6b7280' },
          }}
        />
        <Tooltip
          formatter={(value: any) => [`${value}%`, 'Progress']}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar
          dataKey='progress'
          fill='#3b82f6'
          radius={[0, 4, 4, 0]}
          animationDuration={1500}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderAchievementsChart = () => (
    <ResponsiveContainer width='100%' height={200}>
      <PieChart>
        <Pie
          data={generateAchievementsData()}
          cx='50%'
          cy='50%'
          innerRadius={40}
          outerRadius={80}
          dataKey='count'
          animationDuration={1500}
        >
          {generateAchievementsData().map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any, name: string, props: any) => [
            `${value} badges`,
            props.payload.category,
          ]}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const getChartIcon = () => {
    switch (chartType) {
      case 'savings':
        return <TrendingUp className='h-4 w-4' />;
      case 'goals':
        return <Target className='h-4 w-4' />;
      case 'achievements':
        return <Award className='h-4 w-4' />;
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'savings':
        return 'My Savings Growth';
      case 'goals':
        return 'Goals Progress';
      case 'achievements':
        return 'Achievement Badges';
    }
  };

  const getChartDescription = () => {
    switch (chartType) {
      case 'savings':
        return `Your balance over the last ${
          timeRange === 'week'
            ? 'week'
            : timeRange === 'month'
            ? 'month'
            : '3 months'
        }`;
      case 'goals':
        return 'How close you are to reaching your goals';
      case 'achievements':
        return 'Badges earned by category';
    }
  };

  return (
    <Card className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 chart-outline shadow-glass hover:shadow-glass-lg transition-all duration-300'>
      <CardHeader className='pb-3'>
        <div className='flex justify-between items-start'>
          <div className='flex items-center gap-2'>
            {getChartIcon()}
            <div>
              <CardTitle className='text-lg'>{getChartTitle()}</CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                {getChartDescription()}
              </p>
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={refreshData}
            disabled={isLoading}
            className='h-8 w-8 p-0 hover:bg-white/20 dark:hover:bg-slate-700/20'
          >
            <RefreshCcw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>

        {/* Chart Type Selector */}
        <div className='flex gap-1 mt-3'>
          <Button
            variant={chartType === 'savings' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setChartType('savings')}
            className='h-7 px-2 text-xs'
          >
            <Activity className='h-3 w-3 mr-1' />
            Savings
          </Button>
          <Button
            variant={chartType === 'goals' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setChartType('goals')}
            className='h-7 px-2 text-xs'
          >
            <BarChart3 className='h-3 w-3 mr-1' />
            Goals
          </Button>
          <Button
            variant={chartType === 'achievements' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setChartType('achievements')}
            className='h-7 px-2 text-xs'
          >
            <PieChartIcon className='h-3 w-3 mr-1' />
            Badges
          </Button>
        </div>

        {/* Time Range Selector (only for savings) */}
        {chartType === 'savings' && (
          <div className='flex gap-1 mt-2'>
            <Badge
              variant={timeRange === 'week' ? 'default' : 'outline'}
              className='cursor-pointer text-xs'
              onClick={() => setTimeRange('week')}
            >
              Week
            </Badge>
            <Badge
              variant={timeRange === 'month' ? 'default' : 'outline'}
              className='cursor-pointer text-xs'
              onClick={() => setTimeRange('month')}
            >
              Month
            </Badge>
            <Badge
              variant={timeRange === '3months' ? 'default' : 'outline'}
              className='cursor-pointer text-xs'
              onClick={() => setTimeRange('3months')}
            >
              3 Months
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className='pt-0'>
        {chartType === 'savings' && renderSavingsChart()}
        {chartType === 'goals' && renderGoalsChart()}
        {chartType === 'achievements' && renderAchievementsChart()}

        {/* Quick Stats */}
        <div className='grid grid-cols-3 gap-2 mt-4 pt-3 border-t'>
          <div className='text-center'>
            <p className='text-xs text-muted-foreground'>Current</p>
            <p className='font-semibold text-sm'>{balance} sats</p>
          </div>
          <div className='text-center'>
            <p className='text-xs text-muted-foreground'>Goals</p>
            <p className='font-semibold text-sm'>{goals.length}</p>
          </div>
          <div className='text-center'>
            <p className='text-xs text-muted-foreground'>Badges</p>
            <p className='font-semibold text-sm'>{achievements.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildGrowthChart;
