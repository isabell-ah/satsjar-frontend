import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/UserAuthContext';
import {
  Loader2,
  Sparkles,
  Star,
  Heart,
  Zap,
  PiggyBank,
  Trophy,
  Gift,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState('parent');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [jarId, setJarId] = useState('');
  const [childPin, setChildPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, childLogin } = useAuth();

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Format phone number to ensure it has the correct format
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : phoneNumber.startsWith('0')
        ? `+254${phoneNumber.substring(1)}`
        : `+254${phoneNumber}`;

      await login(formattedPhone, pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await childLogin(jarId, childPin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl'>Login</CardTitle>
        <CardDescription>Access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue='parent'
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className='grid w-full grid-cols-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg'>
            <TabsTrigger
              value='parent'
              className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-700 data-[state=active]:text-white data-[state=active]:shadow-md font-medium rounded-md transition-all duration-200 hover:bg-gray-100'
            >
              👨‍💼 Parent
            </TabsTrigger>
            <TabsTrigger
              value='child'
              className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-md font-medium rounded-md transition-all duration-200 hover:bg-gray-100'
            >
              🧒 Child
            </TabsTrigger>
          </TabsList>

          <TabsContent value='parent'>
            <form onSubmit={handleParentSubmit} className='space-y-5 mt-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='phone'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Phone Number
                </Label>
                <Input
                  id='phone'
                  type='tel'
                  placeholder='e.g. +254712345678'
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className='h-11 border-gray-200 focus:border-slate-400 focus:ring-slate-400 hover:border-gray-300 rounded-lg transition-all duration-200'
                />
              </div>
              <div className='space-y-2'>
                <Label
                  htmlFor='pin'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  PIN
                </Label>
                <Input
                  id='pin'
                  type='password'
                  placeholder='Enter your secure PIN'
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  className='h-11 border-gray-200 focus:border-slate-400 focus:ring-slate-400 hover:border-gray-300 rounded-lg transition-all duration-200'
                />
              </div>
              {error && (
                <div className='p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'>
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {error}
                  </p>
                </div>
              )}
              <Button
                type='submit'
                className='w-full h-11 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200'
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className='flex items-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value='child'>
            <div className='relative bg-gradient-to-br from-amber-50/50 via-yellow-50/30 to-orange-50/50 dark:from-amber-900/10 dark:via-yellow-900/5 dark:to-orange-900/10 rounded-xl p-6'>
              {/* Floating decorative elements with better positioning */}
              <div className='absolute top-3 right-3 text-amber-400/60 animate-pulse'>
                <Star className='h-5 w-5' />
              </div>
              <div className='absolute bottom-3 left-3 text-yellow-400/60 animate-pulse delay-1000'>
                <Sparkles className='h-4 w-4' />
              </div>
              <div className='absolute top-1/2 right-6 text-orange-400/40 animate-bounce delay-500'>
                <Trophy className='h-4 w-4' />
              </div>

              {/* Welcome message for kids */}
              <div className='text-center mb-8 relative z-10'>
                <div className='flex items-center justify-center gap-3 mb-3'>
                  <div className='p-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg'>
                    <PiggyBank className='h-6 w-6 text-white' />
                  </div>
                  <h3 className='text-xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent'>
                    Welcome Back, Super Saver!
                  </h3>
                  <div className='text-2xl animate-bounce'>🌟</div>
                </div>
                {/* <p className='text-sm text-amber-700/80 dark:text-amber-300/80 font-medium'>
                  Ready to check your magical savings jar?
                </p> */}
              </div>

              <form
                onSubmit={handleChildSubmit}
                className='space-y-6 relative z-10'
              >
                <div className='space-y-3'>
                  <Label
                    htmlFor='jarId'
                    className='text-sm font-bold flex items-center gap-2 text-amber-800 dark:text-amber-200'
                  >
                    <div className='p-1.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm'>
                      <PiggyBank className='h-3.5 w-3.5 text-white' />
                    </div>
                    Your Magic Jar ID 🏺
                  </Label>
                  <Input
                    id='jarId'
                    type='text'
                    placeholder='Your special Jar ID (keep it safe!)'
                    value={jarId}
                    onChange={(e) => setJarId(e.target.value)}
                    required
                    className='h-12 border-0 focus:ring-2 focus:ring-amber-400/30 rounded-xl bg-gradient-to-r from-amber-50/80 to-yellow-50/60 dark:from-amber-900/20 dark:to-yellow-900/15 transition-all duration-300 placeholder:text-amber-500/70 text-amber-900 dark:text-amber-100 font-medium shadow-md hover:shadow-lg'
                  />
                </div>

                <div className='space-y-3'>
                  <Label
                    htmlFor='childPin'
                    className='text-sm font-bold flex items-center gap-2 text-orange-800 dark:text-orange-200'
                  >
                    <div className='p-1.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-sm'>
                      <Zap className='h-3.5 w-3.5 text-white' />
                    </div>
                    Your Secret PIN 🔐
                  </Label>
                  <Input
                    id='childPin'
                    type='password'
                    placeholder='Your secret numbers (never share!)'
                    value={childPin}
                    onChange={(e) => setChildPin(e.target.value)}
                    required
                    className='h-12 border-0 focus:ring-2 focus:ring-orange-400/30 rounded-xl bg-gradient-to-r from-yellow-50/80 to-orange-50/60 dark:from-yellow-900/20 dark:to-orange-900/15 transition-all duration-300 placeholder:text-orange-500/70 text-orange-900 dark:text-orange-100 font-medium shadow-md hover:shadow-lg'
                  />
                </div>

                {error && (
                  <div className='p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'>
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  type='submit'
                  className='w-full h-14 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className='flex items-center gap-3'>
                      <Loader2 className='h-6 w-6 animate-spin' />
                      <span>Opening your magical jar... ✨</span>
                    </div>
                  ) : (
                    <div className='flex items-center gap-3'>
                      <div className='p-1 rounded-full bg-white/20'>
                        <PiggyBank className='h-5 w-5' />
                      </div>
                      <span>Open My Savings Jar!</span>
                      <div className='text-xl'>🏆</div>
                    </div>
                  )}
                </Button>

                {/* Beautiful encouragement card */}
                <div className='text-center p-5 rounded-xl bg-gradient-to-br from-amber-100/80 via-yellow-100/60 to-orange-100/80 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/30 shadow-lg'>
                  <div className='flex items-center justify-center gap-3 mb-2'>
                    <div className='p-2 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md'>
                      <Trophy className='h-5 w-5 text-white' />
                    </div>
                    <span className='text-lg font-bold bg-gradient-to-r from-amber-700 via-yellow-700 to-orange-700 bg-clip-text text-transparent'>
                      Savings Champion!
                    </span>
                    <div className='text-xl animate-pulse'>🌟</div>
                  </div>
                  <p className='text-sm text-amber-800/90 dark:text-amber-200/90 font-small'>
                    You're doing amazing! Keep saving for your dreams! 💫
                  </p>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className='flex justify-center'>
        <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
          {activeTab === 'child'
            ? 'Need help? Ask your parent for your login details'
            : "Don't have an account? Contact support to create one"}
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
