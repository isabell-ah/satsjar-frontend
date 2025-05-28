import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Award, Gift, TrendingUp, Star } from 'lucide-react';
import { childrenApi, transactionsApi } from '@/services/api';

interface Child {
  id: string;
  name: string;
  balance: number;
  savingStreak: number;
  lastRewardDate?: string;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  dateEarned: string;
  rewarded: boolean;
}

const RewardSavingHabits = () => {
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rewardAmounts, setRewardAmounts] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    fetchChildrenWithAchievements();
  }, []);

  const fetchChildrenWithAchievements = async () => {
    setIsLoading(true);
    try {
      const childrenData = await childrenApi.getChildren();

      const childrenWithDetails = await Promise.all(
        childrenData.map(async (child) => {
          const details = await childrenApi.getChildDetails(child.id);
          const achievements = await childrenApi.getChildAchievements(child.id);

          // Calculate saving streak (this would be from your backend)
          const savingStreak = details.savingStreak || 0;

          return {
            id: child.id,
            name: child.name,
            balance: details.balance || 0,
            savingStreak,
            lastRewardDate: details.lastRewardDate,
            achievements: achievements.filter((a) => !a.rewarded) || [],
          };
        })
      );

      setChildren(childrenWithDetails);

      // Initialize reward amounts
      const initialRewardAmounts: Record<string, number> = {};
      childrenWithDetails.forEach((child) => {
        child.achievements.forEach((achievement) => {
          initialRewardAmounts[achievement.id] = 100; // Default reward amount
        });
      });
      setRewardAmounts(initialRewardAmounts);
    } catch (error) {
      console.error('Error fetching children with achievements:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load children data and achievements',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewardChange = (achievementId: string, amount: string) => {
    const numericAmount = parseInt(amount) || 0;
    setRewardAmounts((prev) => ({
      ...prev,
      [achievementId]: numericAmount,
    }));
  };

  const handleRewardAchievement = async (
    childId: string,
    achievementId: string
  ) => {
    const amount = rewardAmounts[achievementId];
    if (!amount || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid reward amount',
      });
      return;
    }

    try {
      // Send reward to the child
      await transactionsApi.addFunds({
        childId,
        amount,
        description: 'Reward for good saving habits',
        type: 'reward',
      });

      // Mark achievement as rewarded
      await childrenApi.markAchievementRewarded(childId, achievementId);

      toast({
        title: 'Reward Sent',
        description: `Successfully sent ${amount} sats as a reward`,
      });

      // Refresh data
      fetchChildrenWithAchievements();
    } catch (error) {
      console.error('Error sending reward:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send reward',
      });
    }
  };

  const handleRewardSavingStreak = async (childId: string) => {
    const child = children.find((c) => c.id === childId);
    if (!child) return;

    const streakRewardAmount = child.savingStreak * 50; // 50 sats per week of streak

    try {
      await transactionsApi.addFunds({
        childId,
        amount: streakRewardAmount,
        description: `Reward for ${child.savingStreak} week saving streak`,
        type: 'streak_reward',
      });

      toast({
        title: 'Streak Reward Sent',
        description: `Rewarded ${streakRewardAmount} sats for ${child.savingStreak} week streak!`,
      });

      // Refresh data
      fetchChildrenWithAchievements();
    } catch (error) {
      console.error('Error sending streak reward:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send streak reward',
      });
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Award className='mr-2 h-5 w-5' />
            Reward Good Saving Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center py-8'>
              <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
            </div>
          ) : children.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              No children found or no achievements to reward
            </div>
          ) : (
            <div className='space-y-6'>
              {children.map((child) => (
                <div key={child.id} className='border rounded-lg p-4'>
                  <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-lg font-medium'>{child.name}</h3>
                    <div className='text-sm text-muted-foreground'>
                      Balance: {child.balance} sats
                    </div>
                  </div>

                  {/* Saving Streak Section */}
                  {child.savingStreak > 0 && (
                    <div className='bg-green-50 dark:bg-green-900/20 p-3 rounded-md mb-4'>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center'>
                          <TrendingUp className='h-5 w-5 text-green-600 mr-2' />
                          <div>
                            <p className='font-medium'>
                              Saving Streak: {child.savingStreak} weeks
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              Consistent saving habit!
                            </p>
                          </div>
                        </div>
                        <Button
                          size='sm'
                          onClick={() => handleRewardSavingStreak(child.id)}
                          className='bg-green-600 hover:bg-green-700'
                        >
                          Reward {child.savingStreak * 50} sats
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Achievements Section */}
                  {child.achievements.length > 0 ? (
                    <div className='space-y-4'>
                      <h4 className='font-medium flex items-center'>
                        <Star className='h-4 w-4 mr-1 text-amber-500' />
                        Achievements to Reward
                      </h4>

                      {child.achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className='border-t pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'
                        >
                          <div>
                            <p className='font-medium'>{achievement.name}</p>
                            <p className='text-sm text-muted-foreground'>
                              {achievement.description}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              Earned:{' '}
                              {new Date(
                                achievement.dateEarned
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='w-24'>
                              <Label
                                htmlFor={`reward-${achievement.id}`}
                                className='sr-only'
                              >
                                Reward Amount
                              </Label>
                              <Input
                                id={`reward-${achievement.id}`}
                                type='number'
                                min='1'
                                value={rewardAmounts[achievement.id] || ''}
                                onChange={(e) =>
                                  handleRewardChange(
                                    achievement.id,
                                    e.target.value
                                  )
                                }
                                className='w-full'
                              />
                            </div>
                            <Button
                              onClick={() =>
                                handleRewardAchievement(
                                  child.id,
                                  achievement.id
                                )
                              }
                              className='whitespace-nowrap'
                            >
                              <Gift className='h-4 w-4 mr-1' />
                              Send Reward
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-4 text-muted-foreground'>
                      No unrewarded achievements
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardSavingHabits;
