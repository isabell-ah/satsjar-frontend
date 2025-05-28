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
import { Loader2 } from 'lucide-react';
import { authApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate PIN
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError('PIN must be exactly 6 digits');
      return;
    }

    // Validate PIN confirmation
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number to ensure it has the correct format
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : phoneNumber.startsWith('0')
        ? `+254${phoneNumber.substring(1)}`
        : `+254${phoneNumber}`;

      // Register the parent
      const result = await authApi.register({
        phoneNumber: formattedPhone,
        pin,
      });

      toast({
        title: 'Registration successful',
        description: 'Your account has been created successfully',
      });

      // Automatically log in the user
      await login(formattedPhone, pin);

      // Redirect to parent dashboard instead of add-child page
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description:
          err instanceof Error ? err.message : 'Could not create account',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl'>Create Account</CardTitle>
        <CardDescription>
          Register as a parent to manage your children's accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone Number</Label>
            <Input
              id='phone'
              type='tel'
              placeholder='e.g. +254712345678'
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <p className='text-xs text-muted-foreground'>
              This will be used to log in to your account
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='pin'>Create PIN (6 digits)</Label>
            <Input
              id='pin'
              type='password'
              placeholder='Enter a 6-digit PIN'
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              pattern='\d{6}'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPin'>Confirm PIN</Label>
            <Input
              id='confirmPin'
              type='password'
              placeholder='Confirm your PIN'
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              maxLength={6}
              required
            />
          </div>

          {error && <p className='text-sm text-red-500'>{error}</p>}

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating account...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className='flex justify-center'>
        <p className='text-sm text-muted-foreground'>
          Already have an account?{' '}
          <a href='/login' className='text-primary'>
            Login
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
