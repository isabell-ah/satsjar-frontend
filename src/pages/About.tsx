import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Book, Award, Target, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeToggle from '@/components/ThemeToggle';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-gray-50 dark:from-background dark:to-gray-900 transition-colors duration-300'>
      <div className='max-w-4xl mx-auto px-4 py-8 animate-fade-in'>
        <header className='flex justify-between items-center mb-6'>
          <Link to='/'>
            <Button variant='ghost' className='flex items-center gap-2'>
              <ArrowLeft className='h-4 w-4' />
              Back to Home
            </Button>
          </Link>
          <ThemeToggle />
        </header>

        <div className='text-center mb-10'>
          <h1 className='text-3xl md:text-4xl font-bold mb-3'>
            Sats Jar: Learn to Save with Bitcoin
          </h1>
          <p className='text-muted-foreground text-lg'>
            Financial literacy for the next generation
          </p>
        </div>

        <section className='space-y-8'>
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='text-amber-500' />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <p>
                Sats_Jar is an innovative platform designed to teach financial
                literacy through Bitcoin. By combining a familiar piggy bank
                concept with a mobile app, we leverage M-Pesa's ubiquity and
                Lightning Network Technology to make Bitcoin savings accessible
                and engaging for Kenyan families. Sats Jar transforms financial
                education from abstract lessons into hands-on experience with
                actual Bitcoin, making learning immediate, tangible, and
                exciting.
              </p>
              <p>
                Our target audience includes children looking to learn about
                savings and their parents who want to guide them through this
                journey. We take an educational approach to cryptocurrency,
                focusing on the fundamentals of saving rather than speculation.
              </p>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Target className='text-amber-500' />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <li className='flex items-start gap-2'>
                  <div className='h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-100 shrink-0 mt-0.5'>
                    1
                  </div>
                  <div>
                    <h3 className='font-medium'>Parent & Child Accounts</h3>
                    <p className='text-sm text-muted-foreground'>
                      Secure account relationships with appropriate permissions
                    </p>
                  </div>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-100 shrink-0 mt-0.5'>
                    2
                  </div>
                  <div>
                    <h3 className='font-medium'>Interactive Dashboard</h3>
                    <p className='text-sm text-muted-foreground'>
                      Real-time balance tracking and visualization
                    </p>
                  </div>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-100 shrink-0 mt-0.5'>
                    3
                  </div>
                  <div>
                    <h3 className='font-medium'>Multiple Payment Options</h3>
                    <p className='text-sm text-muted-foreground'>
                      Bitcoin Lightning Network and M-Pesa integration
                    </p>
                  </div>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-100 shrink-0 mt-0.5'>
                    4
                  </div>
                  <div>
                    <h3 className='font-medium'>Achievement System</h3>
                    <p className='text-sm text-muted-foreground'>
                      Badges and rewards to encourage learning and saving
                    </p>
                  </div>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-100 shrink-0 mt-0.5'>
                    5
                  </div>
                  <div>
                    <h3 className='font-medium'>Educational Content</h3>
                    <p className='text-sm text-muted-foreground'>
                      Age-appropriate learning modules about finance
                    </p>
                  </div>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-100 shrink-0 mt-0.5'>
                    6
                  </div>
                  <div>
                    <h3 className='font-medium'>Savings Goals</h3>
                    <p className='text-sm text-muted-foreground'>
                      Set, track and achieve financial targets
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Book className='text-amber-500' />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Sats_Jar works digitally through a mobile app. Here's how the
                process works:
              </p>

              <ol className='space-y-4 mt-4'>
                <li className='flex items-start gap-3'>
                  <div className='h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-100 shrink-0 mt-0.5 font-medium'>
                    1
                  </div>
                  <div>
                    <h3 className='font-medium'>
                      Parents create a child account
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Parents register their child on the app, creating a
                      dedicated savings account.
                    </p>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-100 shrink-0 mt-0.5 font-medium'>
                    2
                  </div>
                  <div>
                    <h3 className='font-medium'>Parents add / deposit Funds</h3>
                    <p>Use Bitcoin Payment via Lightning Network or M-Pesa</p>
                    <p className='text-sm text-muted-foreground'>
                      Using the familiar M-Pesa system, parents can easily add
                      funds to their child's savings.
                    </p>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-100 shrink-0 mt-0.5 font-medium'>
                    3
                  </div>
                  <div>
                    <h3 className='font-medium'>
                      Convert KSh to Bitcoin (sats), (Mpesa)
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Funds are automatically converted to satoshis (the
                      smallest unit of Bitcoin) at current rates.
                    </p>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-100 shrink-0 mt-0.5 font-medium'>
                    4
                  </div>
                  <div>
                    <h3 className='font-medium'>
                      Sats are stored in a custodial Lightning wallet
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Secure storage with instant transaction capabilities using
                      Lightning Network technology.
                    </p>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-100 shrink-0 mt-0.5 font-medium'>
                    5
                  </div>
                  <div>
                    <h3 className='font-medium'>
                      Children track savings through the gamified app
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Interactive features make saving fun while teaching
                      valuable financial lessons.
                    </p>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-100 shrink-0 mt-0.5 font-medium'>
                    6
                  </div>
                  <div>
                    <h3 className='font-medium'>
                      Rural users can access via SMS - coming soon
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Ensuring accessibility even in areas with limited internet
                      connectivity.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Technical Implementation */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='text-amber-500' />
                Technical Implementation & Future Plans
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div className='space-y-2'>
                  <h3 className='font-medium text-lg'>Our Technology Stack</h3>
                  <ul className='space-y-2'>
                    <li className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                      <span>Node.Js(Express.Js) backend </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                      <span>Firebase for database and authentication </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                      <span>React frontend with TypeScript</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                      <span>Responsive design with Tailwind CSS</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                      <span>Interactive UI components (shadcn/ui)</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                      <span>API integration for Bitcoin transactions</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                      <span>Secure authentication system</span>
                    </li>
                  </ul>
                </div>

                <div className='space-y-2'>
                  <h3 className='font-medium text-lg'>Future Development</h3>
                  <ul className='space-y-2'>
                    <li className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                      <span>Inclusion of Physical Sat_Jars</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                      <span>
                        Mobile-first experience for children using Flutter
                      </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                      <span>Global expansion & More payment options</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                      <span>Additional educational content</span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                      <span>
                        Community features for families / Parent Matching
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className='mt-6 pt-4 border-t'>
                <p className='text-center text-muted-foreground'>
                  By starting with a custodial wallet and piloting with 30 - 80
                  families, we can refine our system before scaling to a wider
                  audience.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className='flex justify-center mt-8'>
            <Button
              className='bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
              onClick={() => navigate('/')}
            >
              <Zap className='mr-2 h-4 w-4' />
              Start Your Savings Journey
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
