import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Zap,
  BookOpen,
  Coins,
  MessageSquare,
  ChartBar,
  Wallet,
  Star,
  Phone,
} from 'lucide-react';
import Logo from './Logo';

interface HomePageProps {
  onGetStarted?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  return (
    <div className='animate-fade-in space-y-12 p-4 pb-8'>
      {/* Hero Section */}
      <section className='text-center py-12'>
        <div className='flex justify-center mb-6'>
          <Logo />
        </div>
        <h1 className='text-4xl font-bold mb-4'>
          Small satoshis. Big futures.
        </h1>
        <p className='text-xl text-muted-foreground mb-8'>
          Learn, Earn, Save with Bitcoin for the next generation
        </p>
        <div className='flex gap-4 justify-center'>
          <Button
            className='bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
            onClick={onGetStarted}
          >
            Get Started
          </Button>
          <Link to='/about'>
            <Button variant='outline'>Learn More</Button>
          </Link>
        </div>
      </section>

      {/* Dashboard Card Section */}
      <section className='max-w-4xl mx-auto'>
        <Card className='overflow-hidden border-0 shadow-lg'>
          <div className='bg-gradient-to-br from-amber-500 to-yellow-500 p-6'>
            <CardTitle className='text-2xl text-white text-center'>
              Your Financial Dashboard
            </CardTitle>
            <p className='text-white/90 text-center mt-2'>
              Track progress and manage savings
            </p>
          </div>

          <CardContent className='p-6'>
            {/* Balance Section */}
            <div className='mb-8 p-4 bg-amber-50 rounded-lg'>
              <h3 className='text-lg font-medium mb-2'>Current Balance</h3>
              <div className='flex justify-between items-center'>
                <div>
                  <p className='text-3xl font-bold'>12,500 sats</p>
                  <p className='text-sm text-muted-foreground'>≈ 150 KSh</p>
                </div>
                <div className='bg-white p-3 rounded-full shadow'>
                  <Wallet className='h-8 w-8 text-amber-500' />
                </div>
              </div>
            </div>

            {/* Monthly and Spending Section */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
              <div className='p-4 border rounded-lg'>
                <div className='flex justify-between items-center mb-4'>
                  <h4 className='font-medium'>Monthly Savings</h4>
                  <ChartBar className='h-5 w-5 text-green-500' />
                </div>
                <p className='text-2xl font-bold'>+2,300 sats</p>
                <div className='mt-2 h-2 bg-gray-200 rounded-full'>
                  <div
                    className='h-2 bg-green-500 rounded-full'
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  65% of monthly goal
                </p>
              </div>

              <div className='p-4 border rounded-lg'>
                <div className='flex justify-between items-center mb-4'>
                  <h4 className='font-medium'>Recent Activity</h4>
                  <Coins className='h-5 w-5 text-amber-500' />
                </div>
                <ul className='space-y-2 text-sm'>
                  <li className='flex justify-between'>
                    <span>Learning reward</span>
                    <span className='text-green-500'>+500 sats</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>M-Pesa deposit</span>
                    <span className='text-green-500'>+1,000 sats</span>
                  </li>
                  <li className='flex justify-between'>
                    <span>Savings goal</span>
                    <span className='text-amber-500'>800/5,000 sats</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Feature Section */}
      <section className='py-12 bg-gray-50 rounded-xl p-8'>
        <h2 className='text-2xl font-bold text-center mb-8'>Key Features</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
              <h3 className='font-medium'>SMS Access (Coming soon)</h3>
              <p className='text-sm text-muted-foreground'>
                Rural users can manage accounts via SMS messaging
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className='py-12'>
        <h2 className='text-2xl font-bold text-center mb-8'>
          What Parents Say
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Card className='p-6'>
            <div className='flex mb-4'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className='h-4 w-4 fill-amber-400 text-amber-400'
                />
              ))}
            </div>
            <p className='text-sm mb-4'>
              "My children are learning about saving while actually saving real
              money. The educational games make financial literacy fun!"
            </p>
            <p className='font-medium'>- Sarah M., Parent of two</p>
          </Card>

          <Card className='p-6'>
            <div className='flex mb-4'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className='h-4 w-4 fill-amber-400 text-amber-400'
                />
              ))}
            </div>
            <p className='text-sm mb-4'>
              "The M-Pesa integration makes it so easy to add funds to my
              child's savings. I love watching their Bitcoin grow over time."
            </p>
            <p className='font-medium'>- James K., Father</p>
          </Card>

          <Card className='p-6 md:col-span-2 lg:col-span-1'>
            <div className='flex mb-4'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className='h-4 w-4 fill-amber-400 text-amber-400'
                />
              ))}
            </div>
            <p className='text-sm mb-4'>
              "Even without constant internet access, the SMS features let my
              children in rural areas participate. This is truly inclusive
              financial education."
            </p>
            <p className='font-medium'>- Grace O., Mother of three</p>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className='py-12 bg-amber-50 rounded-xl p-8'>
        <div className='max-w-3xl mx-auto text-center'>
          <h2 className='text-2xl font-bold mb-4'>
            Ready to start your child's Bitcoin journey?
          </h2>
          <p className='mb-6'>
            Join thousands of Kenyan families teaching their children financial
            literacy with Bitcoin
          </p>

          <div className='flex flex-col md:flex-row gap-4 justify-center items-center'>
            <Button
              className='bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
              onClick={onGetStarted}
              size='lg'
            >
              Get Started Now
            </Button>

            <div className='flex items-center gap-2'>
              <Phone className='h-5 w-5 text-amber-600' />
              <span>Questions? Call us at +254 700 000000</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
