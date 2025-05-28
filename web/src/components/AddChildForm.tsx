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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/UserAuthContext';
import { useNavigate } from 'react-router-dom';

const AddChildForm = () => {
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childPin, setChildPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    jarId: string;
    childId: string;
  } | null>(null);
  const { toast } = useToast();
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    // Validate age
    const age = parseInt(childAge);
    if (isNaN(age) || age <= 0 || age > 17) {
      setError('Age must be between 1 and 17');
      return;
    }

    // Validate PIN
    if (childPin.length !== 6 || !/^\d+$/.test(childPin)) {
      setError('PIN must be exactly 6 digits');
      return;
    }

    // Validate PIN confirmation
    if (childPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Make API call to create child account
      const response = await fetch('/api/auth/create-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          childName,
          childAge: age,
          childPin,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create child account');
      }

      const data = await response.json();

      setSuccess({
        jarId: data.jarId,
        childId: data.childId,
      });

      toast({
        title: 'Child account created',
        description: `${childName}'s account has been created successfully. Jar ID: ${data.jarId}`,
      });

      // Reset form
      setChildName('');
      setChildAge('');
      setChildPin('');
      setConfirmPin('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create child account'
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Could not create child account',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl'>Add Child Account</CardTitle>
        <CardDescription>Create a new account for your child</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className='space-y-4 text-center'>
            <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
              <h3 className='font-semibold text-green-700 mb-2'>
                Child Account Created!
              </h3>
              <p className='mb-2'>Your child can now log in using:</p>
              <div className='bg-white p-3 rounded border mb-2'>
                <p className='font-mono text-lg font-bold'>{success.jarId}</p>
                <p className='text-xs text-muted-foreground'>Jar ID</p>
              </div>
              <p className='text-sm text-muted-foreground'>
                Make sure to save this Jar ID and the PIN you created.
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={() => {
                  setSuccess(null);
                  setChildName('');
                  setChildAge('');
                  setChildPin('');
                  setConfirmPin('');
                }}
              >
                Add Another Child
              </Button>
              <Button className='flex-1' onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='childName'>Child's Name</Label>
              <Input
                id='childName'
                type='text'
                placeholder="Enter child's name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='childAge'>Child's Age</Label>
              <Input
                id='childAge'
                type='number'
                min='1'
                max='17'
                placeholder="Enter child's age"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='childPin'>Create PIN for Child (6 digits)</Label>
              <Input
                id='childPin'
                type='password'
                placeholder='Enter a 6-digit PIN'
                value={childPin}
                onChange={(e) => setChildPin(e.target.value)}
                maxLength={6}
                pattern='\d{6}'
                required
              />
              <p className='text-xs text-muted-foreground'>
                Your child will use this PIN to log in
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirmChildPin'>Confirm PIN</Label>
              <Input
                id='confirmChildPin'
                type='password'
                placeholder='Confirm the PIN'
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
                'Create Child Account'
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className='flex justify-center'>
        <p className='text-sm text-muted-foreground'>
          You can add multiple child accounts to your parent account
        </p>
      </CardFooter>
    </Card>
  );
};

export default AddChildForm;
