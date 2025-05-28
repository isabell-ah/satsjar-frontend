import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { savingsApi, goalsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';
import { SavingsPlan, Goal } from '@/types/savings';

interface SavingsPlansProps {
  childId?: string;
  onSuccess?: () => void;
}

const SavingsPlans = ({ childId, onSuccess }: SavingsPlansProps) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPlan, setNewPlan] = useState<{
    name: string;
    amount: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    goalId: string;
  }>({
    name: '',
    amount: '100',
    frequency: 'weekly',
    goalId: '_none',
  });

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await savingsApi.getSavingsPlans(childId);
      setPlans(response);
    } catch (error) {
      console.error('Error fetching savings plans:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load savings plans',
      });
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await goalsApi.getSavingsGoals(childId);
      // Filter only approved goals
      const approvedGoals = response.filter(
        (goal: any) => goal.approved && !goal.completed
      );
      setGoals(
        approvedGoals.map((goal: any) => ({
          id: goal.id,
          name: goal.name,
        }))
      );
    } catch (error) {
      console.error('Error fetching goals:', error);
      setGoals([]);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchGoals();
  }, [childId]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPlan.name || !newPlan.amount) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a name and amount for your savings plan',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const planData = {
        name: newPlan.name,
        amount: parseInt(newPlan.amount),
        frequency: newPlan.frequency,
        childId,
        // Only include goalId if it's not "_none"
        goalId: newPlan.goalId !== '_none' ? newPlan.goalId : undefined,
      };

      const response = await savingsApi.createSavingsPlan(planData);

      toast({
        title: 'Savings Plan Created',
        description: `Your ${newPlan.frequency} savings plan has been set up successfully.`,
      });

      // Reset form
      setNewPlan({
        name: '',
        amount: '100',
        frequency: 'weekly',
        goalId: '_none',
      });
      setShowAddPlan(false);

      // Add the new plan to the list
      const goalName =
        newPlan.goalId !== '_none'
          ? goals.find((g) => g.id === newPlan.goalId)?.name
          : undefined;

      setPlans([
        ...plans,
        {
          id: response.id || `plan-${Date.now()}`,
          name: newPlan.name,
          amount: parseInt(newPlan.amount),
          frequency: newPlan.frequency,
          active: true,
          goalId: newPlan.goalId !== '_none' ? newPlan.goalId : undefined,
          goalName,
          nextExecution: response.nextExecution,
        },
      ]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating savings plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create savings plan',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePlan = async (planId: string, currentActive: boolean) => {
    try {
      // Call the API to toggle the plan
      await savingsApi.toggleSavingsPlan(planId);

      // Update the plan in the local state
      setPlans(
        plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                active: !currentActive,
                pausedAt: !currentActive ? undefined : new Date().toISOString(),
              }
            : plan
        )
      );

      toast({
        title: currentActive ? 'Plan Paused' : 'Plan Activated',
        description: currentActive
          ? 'Your savings plan has been paused'
          : 'Your savings plan has been activated',
      });
    } catch (error) {
      console.error('Error toggling savings plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update savings plan',
      });
    }
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the "${planName}" savings plan? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await savingsApi.deleteSavingsPlan(planId);

      // Remove from local state
      setPlans(plans.filter((plan) => plan.id !== planId));

      toast({
        title: 'Plan Deleted',
        description: `"${planName}" savings plan has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete savings plan. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Automatic Savings Plans</CardTitle>
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
        <CardTitle className='flex items-center gap-2'>
          Automatic Savings Plans
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md flex items-center gap-3 mb-4'>
          <Info className='h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0' />
          <p className='text-sm text-blue-700 dark:text-blue-300'>
            Automatic Plans are regular transfers that happen daily, weekly, or
            monthly to help save consistently.
          </p>
        </div>

        {plans.length > 0 ? (
          <div className='space-y-4'>
            {plans.map((plan) => {
              // Calculate days since paused
              const daysSincePaused = plan.pausedAt
                ? Math.floor(
                    (Date.now() - new Date(plan.pausedAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0;
              const willAutoDelete = !plan.active && daysSincePaused >= 0;
              const daysUntilDeletion = Math.max(0, 5 - daysSincePaused);

              return (
                <div
                  key={plan.id}
                  className={`border p-3 rounded-lg ${
                    !plan.active
                      ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10'
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <p className='font-medium'>{plan.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {plan.amount} sats {plan.frequency}
                        {plan.goalName && ` • For goal: ${plan.goalName}`}
                      </p>
                      {plan.nextExecution && plan.active && (
                        <p className='text-xs text-muted-foreground mt-1'>
                          Next:{' '}
                          {new Date(plan.nextExecution).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Switch
                        checked={plan.active}
                        onCheckedChange={() =>
                          handleTogglePlan(plan.id, plan.active)
                        }
                      />
                      <span className='text-xs text-muted-foreground'>
                        {plan.active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  {/* Paused plan warning and delete option */}
                  {!plan.active && (
                    <div className='space-y-2 mt-3'>
                      <div className='bg-amber-100 dark:bg-amber-900/20 p-3 rounded-md'>
                        <div className='flex items-start gap-2'>
                          <Info className='h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0' />
                          <div className='text-sm'>
                            <p className='text-amber-800 dark:text-amber-200 font-medium'>
                              Plan is paused
                            </p>
                            <p className='text-amber-700 dark:text-amber-300 text-xs mt-1'>
                              {willAutoDelete && daysUntilDeletion > 0
                                ? `Will be automatically deleted in ${daysUntilDeletion} day${
                                    daysUntilDeletion !== 1 ? 's' : ''
                                  } if not reactivated.`
                                : willAutoDelete && daysUntilDeletion === 0
                                ? 'Scheduled for automatic deletion today.'
                                : 'Toggle to reactivate or delete manually.'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        className='w-full'
                      >
                        Delete Plan
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className='text-center py-6 text-muted-foreground'>
            No automatic plans set up yet
          </div>
        )}

        {!showAddPlan ? (
          <Button className='w-full mt-4' onClick={() => setShowAddPlan(true)}>
            Set Up Automatic Plan
          </Button>
        ) : (
          <div className='mt-4 border border-gray-200 dark:border-gray-800 p-4 rounded-lg'>
            <h3 className='font-medium mb-3'>Create Automatic Savings Plan</h3>
            <form onSubmit={handleCreatePlan} className='space-y-3'>
              <div>
                <Label htmlFor='planName'>Plan Name</Label>
                <Input
                  id='planName'
                  value={newPlan.name}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, name: e.target.value })
                  }
                  placeholder='e.g., Weekly Savings'
                  required
                />
              </div>
              <div>
                <Label htmlFor='planAmount'>Amount (sats)</Label>
                <Input
                  id='planAmount'
                  type='number'
                  value={newPlan.amount}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, amount: e.target.value })
                  }
                  placeholder='e.g., 100'
                  required
                />
              </div>
              <div>
                <Label htmlFor='planFrequency'>Frequency</Label>
                <Select
                  value={newPlan.frequency}
                  onValueChange={(value) =>
                    setNewPlan({
                      ...newPlan,
                      frequency: value as 'daily' | 'weekly' | 'monthly',
                    })
                  }
                >
                  <SelectTrigger id='planFrequency'>
                    <SelectValue placeholder='Select frequency' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='daily'>Daily</SelectItem>
                    <SelectItem value='weekly'>Weekly</SelectItem>
                    <SelectItem value='monthly'>Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {goals.length > 0 && (
                <div>
                  <Label htmlFor='planGoal'>Link to Goal (Optional)</Label>
                  <Select
                    value={newPlan.goalId}
                    onValueChange={(value) =>
                      setNewPlan({ ...newPlan, goalId: value })
                    }
                  >
                    <SelectTrigger id='planGoal'>
                      <SelectValue placeholder='Select a goal (optional)' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='_none'>No specific goal</SelectItem>
                      {goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className='flex gap-2'>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Plan'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full'
                  onClick={() => setShowAddPlan(false)}
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

export default SavingsPlans;
