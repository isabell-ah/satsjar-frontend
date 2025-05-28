import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { goalsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/UserAuthContext';

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  status: 'approved' | 'pending' | 'completed';
  description?: string;
}

interface GoalsManagementProps {
  childId?: string;
  onSuccess?: () => void;
}

const GoalsManagement = ({ childId, onSuccess }: GoalsManagementProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    description: '',
  });

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      let response;
      if (childId) {
        response = await goalsApi.getSavingsGoals(childId);
      } else {
        response = await goalsApi.getSavingsGoals();
      }

      setGoals(
        response.map((goal: any) => ({
          id: goal.id,
          name: goal.name,
          target: goal.targetAmount,
          current: goal.currentAmount,
          status:
            goal.status ||
            (goal.approved
              ? goal.completed
                ? 'completed'
                : 'approved'
              : 'pending'),
          description: goal.description,
        }))
      );
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load savings goals',
      });
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [childId]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGoal.name || !newGoal.target) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a name and target amount for your goal',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await goalsApi.createSavingsGoal({
        name: newGoal.name,
        targetAmount: parseInt(newGoal.target),
        description: newGoal.description,
        childId,
      });

      toast({
        title: 'Goal Created',
        description:
          user?.role === 'child'
            ? 'Your savings goal has been created and is pending approval'
            : 'Savings goal has been created successfully',
      });

      setNewGoal({ name: '', target: '', description: '' });
      setShowAddGoal(false);

      // Add the new goal to the list
      setGoals([
        ...goals,
        {
          id: response.id,
          name: newGoal.name,
          target: parseInt(newGoal.target),
          current: 0,
          status: user?.role === 'parent' ? 'approved' : 'pending',
          description: newGoal.description,
        },
      ]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create savings goal',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContributeToGoal = async (goalId: string, amount: number) => {
    try {
      await goalsApi.contributeToGoal(goalId, amount);
      toast({
        title: 'Contribution Successful',
        description: `You've added ${amount} sats to your goal!`,
      });
      fetchGoals(); // Refresh goals to show updated amounts
    } catch (error) {
      console.error('Error contributing to goal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to contribute to goal',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Savings Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-12 w-full mb-4' />
          <Skeleton className='h-24 w-full mb-4' />
          <Skeleton className='h-24 w-full' />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Goals</CardTitle>
      </CardHeader>
      <CardContent>
        {goals.length > 0 ? (
          <div className='space-y-4'>
            {goals.map((goal) => (
              <div
                key={goal.id}
                className='border border-gray-200 dark:border-gray-800 p-3 rounded-lg'
              >
                <div className='flex justify-between mb-2'>
                  <div>
                    <p className='font-medium'>{goal.name}</p>
                    {goal.description && (
                      <p className='text-xs text-muted-foreground'>
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <div className='text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800'>
                    {goal.status === 'pending' ? (
                      <span className='text-amber-600'>Pending Approval</span>
                    ) : goal.status === 'completed' ? (
                      <span className='text-green-600'>Completed</span>
                    ) : (
                      <span className='text-blue-600'>Approved</span>
                    )}
                  </div>
                </div>
                <div className='space-y-1'>
                  <div className='flex justify-between text-xs'>
                    <span>{goal.current} sats</span>
                    <span>{goal.target} sats</span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} />
                  <p className='text-xs text-right text-muted-foreground'>
                    {Math.round((goal.current / goal.target) * 100)}% completed
                  </p>
                </div>

                {goal.status === 'approved' && (
                  <div className='mt-2 flex gap-2'>
                    <Button
                      size='sm'
                      className='w-full'
                      onClick={() => handleContributeToGoal(goal.id, 100)}
                    >
                      Add 100 sats
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='w-full'
                      onClick={() => handleContributeToGoal(goal.id, 500)}
                    >
                      Add 500 sats
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-6 text-muted-foreground'>
            No savings goals yet
          </div>
        )}

        {!showAddGoal ? (
          <Button className='w-full mt-4' onClick={() => setShowAddGoal(true)}>
            Create New Goal
          </Button>
        ) : (
          <div className='mt-4 border border-gray-200 dark:border-gray-800 p-4 rounded-lg'>
            <h3 className='font-medium mb-3'>Create New Savings Goal</h3>
            <form onSubmit={handleCreateGoal} className='space-y-3'>
              <div>
                <Label htmlFor='goalName'>Goal Name</Label>
                <Input
                  id='goalName'
                  value={newGoal.name}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, name: e.target.value })
                  }
                  placeholder='e.g., New Bicycle'
                  required
                />
              </div>
              <div>
                <Label htmlFor='goalTarget'>Target Amount (sats)</Label>
                <Input
                  id='goalTarget'
                  type='number'
                  value={newGoal.target}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, target: e.target.value })
                  }
                  placeholder='e.g., 5000'
                  required
                />
              </div>
              <div>
                <Label htmlFor='goalDescription'>Description (optional)</Label>
                <Textarea
                  id='goalDescription'
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
                  placeholder='What are you saving for?'
                  rows={2}
                />
              </div>
              <div className='flex gap-2'>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Goal'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full'
                  onClick={() => setShowAddGoal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsManagement;
