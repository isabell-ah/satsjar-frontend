import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Book, Zap, CircleCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  reward: number;
  completed: boolean;
  thumbnail: string;
}

interface LearningHubProps {
  onBack: () => void;
}

const LearningHub: React.FC<LearningHubProps> = ({ onBack }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock lessons data
  const lessons: Lesson[] = [
    {
      id: '1',
      title: 'What is Money?',
      description: 'Learn about the basics of money and why we use it.',
      duration: '2 min',
      reward: 10,
      completed: true,
      thumbnail: 'https://placehold.co/200x120/FEF9C3/1e293b?text=Money+Basics',
    },
    {
      id: '2',
      title: 'Why Save Money?',
      description: 'Discover the importance of saving money for the future.',
      duration: '3 min',
      reward: 15,
      completed: true,
      thumbnail: 'https://placehold.co/200x120/DBEAFE/1e293b?text=Saving+Tips',
    },
    {
      id: '3',
      title: 'What is Bitcoin?',
      description: 'Learn about Bitcoin and how it works.',
      duration: '4 min',
      reward: 20,
      completed: false,
      thumbnail: 'https://placehold.co/200x120/FEE2E2/1e293b?text=Bitcoin+101',
    },
    {
      id: '4',
      title: 'Setting Goals',
      description: 'Learn how to set and achieve your savings goals.',
      duration: '2 min',
      reward: 10,
      completed: false,
      thumbnail: 'https://placehold.co/200x120/D1FAE5/1e293b?text=Goal+Setting',
    },
  ];

  const handleCompleteLesson = async (lessonId: string) => {
    setLoading(true);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Lesson completed!',
        description: `You earned ${selectedLesson?.reward} sats for completing this lesson.`,
      });

      setSelectedLesson(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to complete lesson',
        description: 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6 p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto'>
      <Button
        variant='ghost'
        onClick={onBack}
        className='mb-6 hover:bg-white/20 dark:hover:bg-slate-700/20'
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back to Dashboard
      </Button>

      <Card className='chart-outline shadow-glass hover:shadow-glass-lg transition-all duration-300'>
        <CardHeader className='bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 sm:p-8'>
          <CardTitle className='flex items-center text-xl sm:text-2xl'>
            <Book className='mr-3 h-6 w-6 sm:h-7 sm:w-7' />
            Learning Hub
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6 sm:p-8 lg:p-10'>
          {selectedLesson ? (
            <div className='space-y-6'>
              <Button
                variant='outline'
                onClick={() => setSelectedLesson(null)}
                className='hover:bg-white/20 dark:hover:bg-slate-700/20'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to lessons
              </Button>

              <div className='bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-6 sm:p-8 lg:p-10 rounded-xl shadow-inner'>
                <div className='flex justify-center mb-6'>
                  <img
                    src={selectedLesson.thumbnail}
                    alt={selectedLesson.title}
                    className='rounded-xl w-full max-w-lg shadow-lg border border-white/20'
                  />
                </div>

                <h2 className='text-2xl sm:text-3xl font-bold mb-4 text-center'>
                  {selectedLesson.title}
                </h2>
                <div className='flex items-center justify-center gap-4 mb-6'>
                  <span className='text-sm text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-slate-600/70 px-3 py-1 rounded-full'>
                    {selectedLesson.duration}
                  </span>
                  <Badge className='bg-amber-500 text-white px-3 py-1'>
                    +{selectedLesson.reward} sats
                  </Badge>
                </div>

                <p className='mb-6 text-center text-lg text-gray-700 dark:text-gray-200 max-w-2xl mx-auto'>
                  {selectedLesson.description}
                </p>

                <div className='bg-white/80 dark:bg-slate-700/80 p-6 sm:p-8 rounded-xl mb-6 border border-white/30 dark:border-slate-600/30 backdrop-blur-sm'>
                  <p className='text-center italic text-gray-600 dark:text-gray-300'>
                    This is where the lesson content would be displayed. In a
                    real app, this would include videos, interactive elements,
                    or text content.
                  </p>
                </div>

                <Button
                  className='w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                  disabled={loading || selectedLesson.completed}
                  onClick={() => handleCompleteLesson(selectedLesson.id)}
                >
                  {selectedLesson.completed ? (
                    <>
                      <CircleCheck className='mr-2 h-4 w-4' />
                      Already Completed
                    </>
                  ) : loading ? (
                    <>
                      <span className='loading mr-2'></span>
                      Completing...
                    </>
                  ) : (
                    <>
                      <Zap className='mr-2 h-4 w-4' />
                      Complete & Earn {selectedLesson.reward} sats
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className='border border-gray-200/60 dark:border-gray-700/40 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80'
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <div className='relative'>
                    <img
                      src={lesson.thumbnail}
                      alt={lesson.title}
                      className='w-full h-40 sm:h-32 object-cover'
                    />
                    {lesson.completed && (
                      <div className='absolute top-3 right-3'>
                        <Badge className='bg-green-500 text-white shadow-lg'>
                          <CircleCheck className='mr-1 h-3 w-3' />
                          Completed
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className='p-4 sm:p-5'>
                    <h3 className='font-semibold text-lg mb-2'>
                      {lesson.title}
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-300 line-clamp-2 h-10 mb-3'>
                      {lesson.description}
                    </p>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full'>
                        {lesson.duration}
                      </span>
                      <Badge
                        variant='outline'
                        className='border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                      >
                        +{lesson.reward} sats
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningHub;
