import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { transactionsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
  status: string;
}

interface TransactionHistoryProps {
  childId?: string;
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const TransactionHistory = ({
  childId,
  limit = 5,
  showViewAll = true,
  onViewAll,
  onBack,
  showBackButton = false,
}: TransactionHistoryProps) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await transactionsApi.getTransactions(childId);
        setTransactions(response.slice(0, limit));
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load transaction history',
        });
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [childId, limit]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='flex items-center justify-between py-2 border-b'
            >
              <div>
                <Skeleton className='h-4 w-24 mb-2' />
                <Skeleton className='h-3 w-16' />
              </div>
              <Skeleton className='h-4 w-16' />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center'>
            {showBackButton && onBack && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onBack}
                className='mr-2 h-8 w-8 p-0'
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
            )}
            Transaction History
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className='space-y-2'>
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className='flex items-center justify-between py-2 border-b'
              >
                <div>
                  <p className='font-medium'>{transaction.type}</p>
                  <p className='text-xs text-muted-foreground'>
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    transaction.type === 'deposit' ||
                    transaction.type === 'reward'
                      ? 'text-emerald-600'
                      : transaction.type === 'withdrawal'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}
                >
                  {transaction.type === 'deposit' ||
                  transaction.type === 'reward'
                    ? `+${transaction.amount}`
                    : transaction.type === 'withdrawal'
                    ? `-${transaction.amount}`
                    : transaction.amount}{' '}
                  sats
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-6 text-muted-foreground'>
            No transactions yet
          </div>
        )}

        {showViewAll && transactions.length > 0 && (
          <Button variant='outline' onClick={onViewAll} className='w-full mt-4'>
            View Complete History
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
