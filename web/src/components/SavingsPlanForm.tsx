import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, PiggyBank, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { savingsApi, goalsApi } from '@/services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/UserAuthContext';

interface SavingsPlanFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  childId?: string;
}

const SavingsPlanForm: React.FC<SavingsPlanFormProps> = ({
  onBack,
  onSuccess,
  childId,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [planName, setPlanName] = useState('');
  const [amount, setAmount] = useState('100');
  const [frequency, setFrequency] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState('_none');
  const [loadingGoals, setLoadingGoals] = useState(false);

  // Fetch available goals for linking
  useEffect(() => {
    const fetchGoals = async () => {
      setLoadingGoals(true);
      try {
        // Use the goals API to fetch goals
        const response = await goalsApi.getGoals(
          user?.role === 'parent' ? childId : undefined
        );

        setGoals(response.goals || []);
      } catch (error) {
        console.error('Error fetching goals:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load savings goals',
        });

        // Set some sample data for demonstration
        setGoals([
          {
            id: '1',
            name: 'School Books',
            target: 1000,
            current: 800,
            status: 'approved',
          },
          {
            id: '2',
            name: 'Bicycle',
            target: 5000,
            current: 750,
            status: 'pending',
          },
        ]);
      } finally {
        setLoadingGoals(false);
      }
    };

    fetchGoals();
  }, [childId, user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!planName) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please provide a name for your savings plan',
      });
      return;
    }

    const amountValue = parseInt(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than 0',
      });
      return;
    }

    setLoading(true);

    try {
      const planData = {
        name: planName,
        amount: amountValue,
        frequency,
        childId: user?.role === 'parent' ? childId : undefined,
        goalId: selectedGoal !== '_none' ? selectedGoal : undefined,
      };

      await savingsApi.createSavingsPlan(planData);

      toast({
        title: 'Savings Plan Created',
        description: `Your ${frequency} savings plan has been set up successfully.`,
      });

      setPlanName('');
      setAmount('100');
      setFrequency('weekly');
      setSelectedGoal('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating savings plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create savings plan',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-4 p-4 animate-fade-in'>
      <Button variant='ghost' onClick={onBack} className='mb-4'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-500 to-cyan-500 text-white'>
          <CardTitle className='flex items-center'>
            <PiggyBank className='mr-2 h-5 w-5' />
            Create Automatic Savings Plan
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex items-center gap-3 mb-4'>
            <Info className='h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0' />
            <p className='text-sm text-blue-700 dark:text-blue-300'>
              Automatic savings plans help you save regularly without having to
              think about it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='plan-name' className='text-sm font-medium'>
                Plan Name
              </Label>
              <Input
                id='plan-name'
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder='e.g., Weekly Savings, School Fund'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='frequency' className='text-sm font-medium'>
                How often do you want to save?
              </Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder='Select frequency' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='daily'>Daily</SelectItem>
                  <SelectItem value='weekly'>Weekly</SelectItem>
                  <SelectItem value='monthly'>Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='amount' className='text-sm font-medium'>
                How many sats do you want to save each time?
              </Label>
              <div className='flex items-center space-x-4'>
                {['50', '100', '200', '500'].map((amt) => (
                  <Button
                    key={amt}
                    type='button'
                    variant={amount === amt ? 'default' : 'outline'}
                    className={`flex-1 ${
                      amount === amt
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'border-blue-500 text-blue-600'
                    }`}
                    onClick={() => setAmount(amt)}
                  >
                    {amt}
                  </Button>
                ))}
              </div>
              <Input
                id='custom-amount'
                type='number'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder='Custom amount'
                className='mt-2'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='goal' className='text-sm font-medium'>
                Link to a Savings Goal (Optional)
              </Label>
              <Select
                value={selectedGoal}
                onValueChange={setSelectedGoal}
                disabled={loadingGoals || goals.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a goal (optional)' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='_none'>
                    No goal (general savings)
                  </SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.name} ({goal.current}/{goal.target} sats)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {goals.length === 0 && !loadingGoals && (
                <p className='text-sm text-muted-foreground'>
                  No goals available. Create a goal first to link it to your
                  savings plan.
                </p>
              )}
            </div>

            <div className='pt-4'>
              <Button
                type='submit'
                className='w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className='loading mr-2'></span>
                    Creating Plan...
                  </>
                ) : (
                  <>
                    <PiggyBank className='mr-2 h-4 w-4' />
                    Create Savings Plan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SavingsPlanForm;
