
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Award, Star, CircleCheck } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  date?: string;
  icon: 'star' | 'award' | 'check';
}

interface AchievementsProps {
  onBack: () => void;
}

const Achievements: React.FC<AchievementsProps> = ({ onBack }) => {
  // Mock achievements data
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Saver',
      description: 'Made your first deposit',
      earned: true,
      date: '2023-05-10',
      icon: 'star'
    },
    {
      id: '2',
      name: 'Money Genius',
      description: 'Completed 5 financial lessons',
      earned: true,
      date: '2023-05-15',
      icon: 'award'
    },
    {
      id: '3',
      name: 'Goal Setter',
      description: 'Created your first savings goal',
      earned: true,
      date: '2023-05-12',
      icon: 'check'
    },
    {
      id: '4',
      name: 'Super Saver',
      description: 'Saved 1,000 sats',
      earned: false,
      icon: 'star'
    },
    {
      id: '5',
      name: 'Bitcoin Expert',
      description: 'Completed all Bitcoin lessons',
      earned: false,
      icon: 'award'
    }
  ];
  
  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'star':
        return <Star className="h-5 w-5" />;
      case 'award':
        return <Award className="h-5 w-5" />;
      case 'check':
        return <CircleCheck className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 border rounded-lg ${
                  achievement.earned
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200 opacity-70'
                } transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      achievement.earned 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {renderIcon(achievement.icon)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Earned on {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {achievement.earned ? (
                    <Badge className="bg-green-500">Earned</Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-300 text-gray-500">Locked</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Achievements;
