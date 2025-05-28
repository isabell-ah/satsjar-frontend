import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Award,
  Star,
  Book,
  Trophy,
  CheckCircle2,
  Target,
  Coins,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { achievementsApi, childrenApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/UserAuthContext';

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  awarded: any;
  rewardAmount?: number;
}

interface Child {
  id: string;
  name: string;
  balance: number;
  goals: any[];
}

interface ChildAchievementsPageProps {
  onBack?: () => void;
}

const ChildAchievementsPage = ({ onBack }: ChildAchievementsPageProps) => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [childData, setChildData] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('earned');

  const handleBackToDashboard = () => {
    // If onBack prop is provided (from Index.tsx), use it
    if (onBack) {
      onBack();
      return;
    }

    // Check if we came from a parent viewing child dashboard
    if (location.state?.fromParentView || user?.role === 'parent') {
      // Navigate back to the child dashboard page (parent view)
      navigate(`/child-dashboard/${childId}`);
    } else {
      // Navigate back to main dashboard (child's own view)
      navigate('/');
    }
  };

  // Fetch achievements and child data
  useEffect(() => {
    const fetchData = async () => {
      // Determine the target child ID
      const targetChildId =
        childId || (user?.role === 'child' ? user.id : null);

      if (!targetChildId) {
        console.error('No child ID available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch achievements
        let achievementsResponse;

        // If this is a child logged in directly (no childId), use getMyAchievements
        // If this is a parent viewing a child (has childId), use getChildAchievements
        if (!childId && user?.role === 'child') {
          console.log('Child logged in directly - using getMyAchievements');
          achievementsResponse = await achievementsApi.getMyAchievements();
        } else {
          console.log(
            'Parent viewing child or child data available - using getChildAchievements'
          );
          achievementsResponse = await achievementsApi.getChildAchievements(
            targetChildId
          );
        }

        setAchievements(achievementsResponse.achievements || []);

        // Fetch child data
        if (childId) {
          // Parent viewing child - fetch child details
          const childResponse = await childrenApi.getChildDetails(childId);
          setChildData(childResponse);
        } else if (user?.role === 'child') {
          // Child viewing their own achievements - use user data
          setChildData({
            id: user.id,
            name: user.name || 'You',
            balance: user.balance || 0,
            goals: [], // Will be populated if needed
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load achievements data.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [childId, user, toast]);

  // Achievement type configurations
  const achievementTypes = {
    first_deposit: {
      name: 'First Saver',
      icon: <Star className='h-8 w-8 text-white' />,
      gradient: 'from-amber-400 to-yellow-500',
      description: 'Made first deposit',
      category: 'savings',
    },
    quiz_perfect: {
      name: 'Quiz Master',
      icon: <Book className='h-8 w-8 text-white' />,
      gradient: 'from-blue-400 to-blue-600',
      description: 'Perfect quiz score',
      category: 'learning',
    },
    first_lesson: {
      name: 'Learning Star',
      icon: <Book className='h-8 w-8 text-white' />,
      gradient: 'from-purple-400 to-purple-600',
      description: 'Completed first lesson',
      category: 'learning',
    },
    module_completed: {
      name: 'Module Master',
      icon: <Award className='h-8 w-8 text-white' />,
      gradient: 'from-green-400 to-green-600',
      description: 'Completed learning module',
      category: 'learning',
    },
    goal_achieved: {
      name: 'Goal Achiever',
      icon: <Target className='h-8 w-8 text-white' />,
      gradient: 'from-indigo-400 to-indigo-600',
      description: 'Reached savings goal',
      category: 'savings',
    },
    saving_streak: {
      name: 'Saving Streak',
      icon: <TrendingUp className='h-8 w-8 text-white' />,
      gradient: 'from-orange-400 to-red-500',
      description: 'Consistent saver',
      category: 'savings',
    },
  };

  // Generate potential achievements based on child's progress
  const getPotentialAchievements = () => {
    if (!childData) return [];

    const potential = [];
    const earnedTypes = achievements.map((a) => a.type);

    // First Saver - if has balance but no achievement yet
    if (childData.balance > 0 && !earnedTypes.includes('first_deposit')) {
      potential.push({
        ...achievementTypes.first_deposit,
        progress: 100,
        requirement: 'Make your first deposit',
      });
    }

    // Goal Achiever - if has completed goals but no achievement yet
    const hasCompletedGoals = childData.goals?.some(
      (g) => g.status === 'completed'
    );
    if (hasCompletedGoals && !earnedTypes.includes('goal_achieved')) {
      potential.push({
        ...achievementTypes.goal_achieved,
        progress: 100,
        requirement: 'Complete your first savings goal',
      });
    }

    // Add other potential achievements
    if (!earnedTypes.includes('quiz_perfect')) {
      potential.push({
        ...achievementTypes.quiz_perfect,
        progress: 0,
        requirement: 'Score 100% on any quiz',
      });
    }

    if (!earnedTypes.includes('first_lesson')) {
      potential.push({
        ...achievementTypes.first_lesson,
        progress: 0,
        requirement: 'Complete your first learning lesson',
      });
    }

    return potential;
  };

  const earnedAchievements = achievements.map((achievement) => {
    const config =
      achievementTypes[achievement.type as keyof typeof achievementTypes];
    return {
      ...achievement,
      ...config,
      earnedDate: achievement.awarded,
    };
  });

  const potentialAchievements = getPotentialAchievements();
  const totalEarned = earnedAchievements.length;
  const totalPossible = Object.keys(achievementTypes).length;

  if (loading) {
    return (
      <div className='container max-w-md mx-auto p-4'>
        <div className='flex flex-col items-center justify-center min-h-screen'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4'></div>
          <p className='text-muted-foreground'>Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container max-w-md mx-auto p-4 space-y-4'>
      <Button
        variant='ghost'
        size='sm'
        className='mb-4'
        onClick={handleBackToDashboard}
      >
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to Dashboard
      </Button>

      {/* Header Card */}
      <Card className='bg-gradient-to-r from-purple-500 to-indigo-600 text-white'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold flex items-center'>
                <Trophy className='h-6 w-6 mr-2' />
                Achievements
              </h1>
              <p className='text-purple-100 mt-1'>
                {childData?.name ? `${childData.name}'s` : 'Your'} achievement
                collection
              </p>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold'>{totalEarned}</div>
              <div className='text-sm text-purple-200'>Earned</div>
            </div>
          </div>

          <div className='mt-4'>
            <div className='flex justify-between text-sm mb-2'>
              <span>Progress</span>
              <span>
                {totalEarned}/{totalPossible}
              </span>
            </div>
            <Progress
              value={(totalEarned / totalPossible) * 100}
              className='h-2 bg-purple-400/30'
            />
          </div>
        </CardContent>
      </Card>

      {/* Achievement Stats */}
      <div className='grid grid-cols-3 gap-3'>
        <Card>
          <CardContent className='p-4 text-center'>
            <Coins className='h-6 w-6 mx-auto mb-2 text-amber-500' />
            <div className='text-lg font-bold'>
              {achievements.reduce((sum, a) => sum + (a.rewardAmount || 0), 0)}
            </div>
            <div className='text-xs text-muted-foreground'>Sats Earned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <Star className='h-6 w-6 mx-auto mb-2 text-blue-500' />
            <div className='text-lg font-bold'>
              {
                earnedAchievements.filter((a) => a.category === 'learning')
                  .length
              }
            </div>
            <div className='text-xs text-muted-foreground'>Learning</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <Target className='h-6 w-6 mx-auto mb-2 text-green-500' />
            <div className='text-lg font-bold'>
              {
                earnedAchievements.filter((a) => a.category === 'savings')
                  .length
              }
            </div>
            <div className='text-xs text-muted-foreground'>Savings</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid grid-cols-2 mb-4'>
          <TabsTrigger value='earned'>Earned ({totalEarned})</TabsTrigger>
          <TabsTrigger value='available'>
            Available ({potentialAchievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='earned' className='space-y-4'>
          {earnedAchievements.length === 0 ? (
            <Card>
              <CardContent className='p-8 text-center'>
                <Award className='h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50' />
                <h3 className='font-medium mb-2'>No achievements yet</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Start saving or learning to earn your first achievement!
                </p>
                <Button onClick={() => setActiveTab('available')}>
                  View Available Achievements
                </Button>
              </CardContent>
            </Card>
          ) : (
            earnedAchievements.map((achievement) => (
              <Card key={achievement.id} className='overflow-hidden'>
                <CardContent className='p-0'>
                  <div className='flex items-center'>
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${achievement.gradient} flex items-center justify-center relative`}
                    >
                      {achievement.icon}
                      <div className='absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center'>
                        <CheckCircle2 className='h-4 w-4 text-white' />
                      </div>
                    </div>
                    <div className='flex-1 p-4'>
                      <div className='flex items-center justify-between mb-1'>
                        <h3 className='font-semibold'>{achievement.name}</h3>
                        {achievement.rewardAmount && (
                          <Badge
                            variant='outline'
                            className='border-amber-500 text-amber-600'
                          >
                            +{achievement.rewardAmount} sats
                          </Badge>
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground mb-2'>
                        {achievement.description}
                      </p>
                      {achievement.earnedDate && (
                        <div className='flex items-center text-xs text-green-600'>
                          <Calendar className='h-3 w-3 mr-1' />
                          Earned{' '}
                          {new Date(
                            achievement.earnedDate.seconds * 1000
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value='available' className='space-y-4'>
          {potentialAchievements.length === 0 ? (
            <Card>
              <CardContent className='p-8 text-center'>
                <Trophy className='h-12 w-12 mx-auto mb-4 text-amber-500' />
                <h3 className='font-medium mb-2'>All achievements earned!</h3>
                <p className='text-sm text-muted-foreground'>
                  Congratulations! You've earned all available achievements.
                </p>
              </CardContent>
            </Card>
          ) : (
            potentialAchievements.map((achievement, index) => (
              <Card key={index} className='overflow-hidden opacity-75'>
                <CardContent className='p-0'>
                  <div className='flex items-center'>
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${
                        achievement.progress === 100
                          ? achievement.gradient
                          : 'from-gray-300 to-gray-400'
                      } flex items-center justify-center`}
                    >
                      {achievement.icon}
                    </div>
                    <div className='flex-1 p-4'>
                      <div className='flex items-center justify-between mb-1'>
                        <h3 className='font-semibold'>{achievement.name}</h3>
                        {achievement.progress === 100 && (
                          <Badge className='bg-green-500'>
                            Ready to claim!
                          </Badge>
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground mb-2'>
                        {achievement.description}
                      </p>
                      <p className='text-xs text-blue-600'>
                        📋 {achievement.requirement}
                      </p>
                      {achievement.progress !== undefined && (
                        <div className='mt-2'>
                          <Progress
                            value={achievement.progress}
                            className='h-1'
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChildAchievementsPage;
