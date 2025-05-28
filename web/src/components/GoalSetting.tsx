import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Star, PiggyBank, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { goalsApi } from '@/services/api';
import { useAuth } from '@/contexts/UserAuthContext';

interface GoalSettingProps {
  onBack: () => void;
  onSuccess?: () => void;
  childId?: string;
}

const GoalSetting: React.FC<GoalSettingProps> = ({
  onBack,
  onSuccess,
  childId,
}) => {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('1000');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goalName) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please provide a name for your savings goal',
      });
      return;
    }

    const target = parseInt(targetAmount);
    if (isNaN(target) || target <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter a valid target amount greater than 0',
      });
      return;
    }

    setLoading(true);

    try {
      const goalData = {
        name: goalName,
        targetAmount: target,
        description: description,
        childId: user?.role === 'parent' ? childId : undefined,
      };

      await goalsApi.createSavingsGoal(goalData);

      toast({
        title: 'Goal created!',
        description:
          user?.role === 'child'
            ? 'Your goal has been submitted for approval.'
            : `Goal "${goalName}" has been created successfully.`,
      });

      // Clear form
      setGoalName('');

      if (onSuccess) {
        onSuccess();
      } else {
        onBack();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create goal',
        description:
          error instanceof Error ? error.message : 'Please try again later.',
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
        <CardHeader className='bg-gradient-to-r from-amber-500 to-yellow-500 text-white'>
          <CardTitle className='flex items-center'>
            <Star className='mr-2 h-5 w-5' />
            Set a Savings Goal
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='goal-name' className='text-sm font-medium'>
                What are you saving for?
              </label>
              <Input
                id='goal-name'
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder='e.g., New Toy, School Books'
                required
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='target-amount' className='text-sm font-medium'>
                How many sats do you want to save?
              </label>
              <div className='flex items-center space-x-4'>
                {['500', '1000', '2000', '5000'].map((amount) => (
                  <Button
                    key={amount}
                    type='button'
                    variant={targetAmount === amount ? 'default' : 'outline'}
                    className={`flex-1 ${
                      targetAmount === amount
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'border-amber-500 text-amber-600'
                    }`}
                    onClick={() => setTargetAmount(amount)}
                  >
                    {amount}
                  </Button>
                ))}
              </div>
              <Input
                id='custom-target'
                type='number'
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder='Custom amount'
                className='mt-2'
              />
            </div>

            <div className='pt-4'>
              <Button
                type='submit'
                className='w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className='loading mr-2'></span>
                    Creating Goal...
                  </>
                ) : (
                  <>
                    <PiggyBank className='mr-2 h-4 w-4' />
                    Create Goal
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

export default GoalSetting;
