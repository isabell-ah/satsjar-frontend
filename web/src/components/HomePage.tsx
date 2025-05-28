import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, BookOpen, Coins, MessageSquare } from 'lucide-react';
import Logo from './Logo';

interface HomePageProps {
  onGetStarted?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  return (
    <div className='animate-fade-in space-y-6 p-4 pb-8'>
      <div className='flex justify-center mb-6'>
        <Logo />
      </div>

      <Card className='overflow-hidden border-0 shadow-lg'>
        <div className='bg-gradient-to-br from-amber-500 to-yellow-500 p-6'>
          <CardTitle className='text-2xl text-white text-center'>
            Small satoshis. Big futures.
          </CardTitle>
          <p className='text-white/90 text-center mt-2'>(Learn, Earn Save)</p>
        </div>

        <CardContent className='p-6 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex items-start space-x-3'>
              <div className='bg-amber-100 p-2 rounded-lg'>
                <BookOpen className='h-5 w-5 text-amber-600' />
              </div>
              <div>
                <h3 className='font-medium'>Learn & Earn</h3>
                <p className='text-sm text-muted-foreground'>
                  Interactive games and lessons about financial literacy
                </p>
              </div>
            </div>
            <div className='flex items-start space-x-3'>
              <div className='bg-amber-100 p-2 rounded-lg'>
                <Zap className='h-5 w-5 text-amber-600' />
              </div>
              <div>
                <h3 className='font-medium'>Bitcoin Savings</h3>
                <p className='text-sm text-muted-foreground'>
                  Secure custodial Lightning wallet for children's savings
                </p>
              </div>
            </div>
            <div className='flex items-start space-x-3'>
              <div className='bg-amber-100 p-2 rounded-lg'>
                <Coins className='h-5 w-5 text-amber-600' />
              </div>
              <div>
                <h3 className='font-medium'>M-Pesa Integration</h3>
                <p className='text-sm text-muted-foreground'>
                  Parents deposit KSh via M-Pesa, converted to Bitcoin sats
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-3'>
              <div className='bg-amber-100 p-2 rounded-lg'>
                <MessageSquare className='h-5 w-5 text-amber-600' />
              </div>
              <div>
                <h3 className='font-medium'>SMS Access (Cooming soon..)</h3>
                <p className='text-sm text-muted-foreground'>
                  Rural users can manage accounts via SMS messaging
                </p>
              </div>
            </div>
          </div>

          <div className='mt-6 pt-4 border-t text-center'>
            <p className='text-muted-foreground mb-4'>
              A fun, educational approach to financial literacy & Bitcoin
              savings for Kenyan families.
            </p>

            <div className='flex gap-3 justify-center'>
              <Link to='/about'>
                <Button variant='outline'>Learn More</Button>
              </Link>
              <Button
                className='bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                onClick={onGetStarted}
              >
                Get Started
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
