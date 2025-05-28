import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UserAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  PiggyBank,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  RefreshCcw,
  AlertCircle,
} from 'lucide-react';
import { savingsApi, transactionsApi } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  timestamp: string;
  balance?: number;
  planName?: string;
  goalName?: string;
}

interface SavingsHistoryProps {
  childId?: string;
  onBack?: () => void;
  timeframe?: 'week' | 'month' | 'year';
  onChangeTimeframe?: (timeframe: 'week' | 'month' | 'year') => void;
}

const SavingsHistory: React.FC<SavingsHistoryProps> = ({
  childId,
  onBack,
  timeframe: externalTimeframe,
  onChangeTimeframe,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localTimeframe, setLocalTimeframe] = useState<
    'week' | 'month' | 'year'
  >(externalTimeframe || 'month');

  const isParent = user?.role === 'parent';
  const effectiveChildId =
    childId || (user?.role === 'child' ? user?.id : undefined);

  console.log('SavingsHistory component', {
    childId,
    effectiveChildId,
    isParent,
    timeframe: localTimeframe,
  });

  const handleTimeframeChange = (newTimeframe: 'week' | 'month' | 'year') => {
    setLocalTimeframe(newTimeframe);
    if (onChangeTimeframe) {
      onChangeTimeframe(newTimeframe);
    }
  };

  // Fetch savings history
  const fetchSavingsHistory = async (showRefreshIndicator = false) => {
    if (!effectiveChildId) {
      setIsLoading(false);
      return;
    }

    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      console.log('Fetching savings history for child:', effectiveChildId);

      let response;
      if (isParent && childId) {
        // If parent is viewing a child's savings history
        response = await transactionsApi.getChildTransactions(childId);
      } else {
        // For child viewing their own savings history
        response = await transactionsApi.getHistory();
      }

      console.log('Savings history response:', response);

      if (response && response.transactions) {
        // Filter transactions related to savings
        const savingsTransactions = response.transactions.filter(
          (tx: any) =>
            tx.type === 'deposit' ||
            tx.type === 'withdrawal' ||
            tx.type === 'auto_savings' ||
            tx.type === 'goal_created' ||
            tx.type === 'goal_completed'
        );

        // Sort by timestamp (newest first)
        savingsTransactions.sort(
          (a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setTransactions(savingsTransactions);
      } else {
        setError('No transaction data available');
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch savings history:', error);
      setError('Failed to load transaction history');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load transaction history',
      });
      setTransactions([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSavingsHistory();
  }, [effectiveChildId, localTimeframe]);

  // Filter transactions based on selected timeframe
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.timestamp);
    const now = new Date();

    if (localTimeframe === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return transactionDate >= weekAgo;
    } else if (localTimeframe === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return transactionDate >= monthAgo;
    } else if (localTimeframe === 'year') {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return transactionDate >= yearAgo;
    }

    return true;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'auto_savings':
        return <ArrowDownCircle className='h-5 w-5 text-green-500' />;
      case 'withdrawal':
        return <ArrowUpCircle className='h-5 w-5 text-red-500' />;
      case 'goal_created':
      case 'goal_completed':
        return <Calendar className='h-5 w-5 text-blue-500' />;
      default:
        return <Calendar className='h-5 w-5 text-blue-500' />;
    }
  };

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return transaction.description || 'Manual Deposit';
      case 'withdrawal':
        return transaction.description || 'Withdrawal';
      case 'auto_savings':
        return `Auto Savings: ${transaction.planName || 'Savings Plan'}`;
      case 'goal_created':
        return `Goal Created: ${transaction.goalName || 'Savings Goal'}`;
      case 'goal_completed':
        return `Goal Completed: ${transaction.goalName || 'Savings Goal'}`;
      default:
        return transaction.description || 'Transaction';
    }
  };

  const formatDate = (date: Date) => {
    // Check if today
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  if (!effectiveChildId) {
    return (
      <Card>
        <CardContent className='py-8 text-center'>
          <p className='text-muted-foreground'>
            Please select a child to view savings history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Savings History</h2>
        <div className='flex space-x-2'>
          {onBack && (
            <Button variant='outline' onClick={onBack}>
              Back
            </Button>
          )}
          <Button
            variant='outline'
            size='icon'
            onClick={() => fetchSavingsHistory(true)}
            disabled={isRefreshing}
          >
            <RefreshCcw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>Transactions</CardTitle>
            <div className='flex space-x-2'>
              <Button
                variant={localTimeframe === 'week' ? 'default' : 'outline'}
                size='sm'
                onClick={() => handleTimeframeChange('week')}
              >
                Week
              </Button>
              <Button
                variant={localTimeframe === 'month' ? 'default' : 'outline'}
                size='sm'
                onClick={() => handleTimeframeChange('month')}
              >
                Month
              </Button>
              <Button
                variant={localTimeframe === 'year' ? 'default' : 'outline'}
                size='sm'
                onClick={() => handleTimeframeChange('year')}
              >
                Year
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 p-3 rounded-md flex items-center gap-3 mb-4'>
              <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0' />
              <p className='text-sm text-red-700 dark:text-red-300'>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className='space-y-3'>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className='flex items-center gap-3 p-3 border rounded-md'
                >
                  <Skeleton className='h-10 w-10 rounded-full' />
                  <div className='flex-1'>
                    <Skeleton className='h-4 w-2/3 mb-2' />
                    <Skeleton className='h-3 w-1/3' />
                  </div>
                  <Skeleton className='h-5 w-16' />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className='text-center p-8'>
              <PiggyBank className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
              <p className='text-muted-foreground'>
                No savings transactions found for this period.
              </p>
              <p className='text-xs text-muted-foreground mt-2'>
                Try selecting a different time period or start saving to see
                your history.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className='flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors'
                >
                  <div className='flex-shrink-0'>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium'>
                      {getTransactionTitle(transaction)}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {formatDate(new Date(transaction.timestamp))}
                    </p>
                  </div>
                  <div
                    className={`font-semibold ${
                      transaction.type === 'withdrawal'
                        ? 'text-red-600'
                        : transaction.type === 'deposit' ||
                          transaction.type === 'auto_savings'
                        ? 'text-green-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {transaction.type === 'withdrawal'
                      ? '-'
                      : transaction.type === 'deposit' ||
                        transaction.type === 'auto_savings'
                      ? '+'
                      : ''}
                    {transaction.amount} sats
                    {transaction.balance && (
                      <div className='text-xs text-muted-foreground text-right'>
                        Balance: {transaction.balance} sats
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredTransactions.length > 0 &&
                filteredTransactions.length < transactions.length && (
                  <div className='text-center pt-2'>
                    <p className='text-xs text-muted-foreground'>
                      Showing {filteredTransactions.length} of{' '}
                      {transactions.length} transactions
                    </p>
                  </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SavingsHistory;
