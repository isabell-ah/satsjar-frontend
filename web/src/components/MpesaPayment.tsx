import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Phone, Loader2, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/UserAuthContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { mpesaApi } from '@/services/api';

interface MpesaPaymentProps {
  childId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onBack?: () => void;
}

const MpesaPayment = ({
  childId,
  onSuccess,
  onCancel,
  onBack,
}: MpesaPaymentProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    'success' | 'failed' | 'pending' | null
  >(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const isParent = user?.role === 'parent';

  const handleInitiateMpesa = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !amount) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields',
      });
      return;
    }

    setLoading(true);

    try {
      // Format phone number to ensure it has the correct format
      // The backend expects format: 254XXXXXXXXX, +254XXXXXXXXX, or 0XXXXXXXXX
      let formattedPhone = phoneNumber;

      // Remove any spaces or dashes
      formattedPhone = formattedPhone.replace(/[\s-]/g, '');

      // Format according to expected pattern
      if (formattedPhone.startsWith('+')) {
        // Keep as is if it starts with +
        formattedPhone = formattedPhone;
      } else if (formattedPhone.startsWith('0')) {
        // Convert 07XXXXXXXX to +2547XXXXXXXX
        formattedPhone = `+254${formattedPhone.substring(1)}`;
      } else if (
        !formattedPhone.startsWith('254') &&
        !formattedPhone.startsWith('+254')
      ) {
        // If it doesn't start with 254 or +254, assume it's a local number without the leading 0
        formattedPhone = `+254${formattedPhone}`;
      }

      console.log('Formatted phone number:', formattedPhone);
      console.log('Amount:', amount);
      console.log('Child ID:', childId);
      console.log('Is parent:', isParent);
      console.log('mpesaApi available:', !!mpesaApi);

      const amountValue = parseInt(amount);

      // Validate amount
      if (amountValue < 10 || amountValue > 150000) {
        throw new Error('Amount must be between 10 and 150,000 KES');
      }

      // Check if mpesaApi is available
      if (!mpesaApi) {
        throw new Error('M-Pesa API not available');
      }

      // Use the appropriate API endpoint based on whether this is a parent funding a child's account
      const response =
        isParent && childId
          ? await mpesaApi.initiateChildPayment(
              childId,
              formattedPhone,
              amountValue
            )
          : await mpesaApi.initiateSTKPush(formattedPhone, amountValue);

      console.log('M-Pesa API response:', response);

      setTransactionId(response.transactionId);
      setShowResult(true);
      setPaymentStatus(null);

      toast({
        title: 'STK Push Initiated',
        description: 'Please check your phone to complete the payment',
      });
    } catch (error) {
      console.error('M-Pesa initiation error:', error);
      toast({
        variant: 'destructive',
        title: 'M-Pesa initiation failed',
        description:
          error instanceof Error
            ? error.message
            : "Couldn't start M-Pesa payment",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!transactionId) return;

    setCheckingStatus(true);
    try {
      const result = await mpesaApi.checkStatus(transactionId);

      if (result.status === 'completed') {
        setPaymentStatus('success');
        toast({
          title: 'Payment Successful',
          description: `KES ${amount} has been added to the account`,
        });
        if (onSuccess) onSuccess();
      } else if (result.status === 'failed') {
        setPaymentStatus('failed');
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: result.message || 'Your payment could not be processed',
        });
      } else {
        setPaymentStatus('pending');
        toast({
          title: 'Payment Pending',
          description: 'Your payment is still being processed',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error checking payment',
        description:
          error instanceof Error
            ? error.message
            : "Couldn't verify payment status",
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-xl font-bold'>M-Pesa Payment</CardTitle>
        <Button
          variant='ghost'
          size='sm'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Back button clicked');
            if (typeof onBack === 'function') {
              onBack();
            } else if (typeof onCancel === 'function') {
              onCancel();
            } else {
              // Fallback: try to go back in browser history
              console.log('No onBack or onCancel provided, using browser back');
              window.history.back();
            }
          }}
          type='button'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back
        </Button>
      </CardHeader>
      <CardContent className='pt-6'>
        {!showResult ? (
          <form onSubmit={handleInitiateMpesa} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                id='phone'
                type='tel'
                placeholder='e.g 254712345678'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <p className='text-xs text-muted-foreground'>
                Enter the M-Pesa phone number to receive the payment request
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='amount'>Amount (KES)</Label>
              <Input
                id='amount'
                type='number'
                placeholder='Enter amount'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min='10'
              />
            </div>
            <Button
              type='submit'
              className='w-full bg-mpesa hover:bg-mpesa/90'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className='mr-2 h-4 w-4' />
                  Initiate STK Push
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className='space-y-6'>
            <Alert className='bg-mpesa/10 border-mpesa'>
              <Wallet className='h-4 w-4' />
              <AlertTitle>STK Push Initiated</AlertTitle>
              <AlertDescription>
                A payment request has been sent to your phone. Please check your
                phone to complete the payment.
              </AlertDescription>
            </Alert>

            <div className='text-center space-y-2'>
              <p className='text-sm text-muted-foreground'>Transaction ID:</p>
              <p className='font-mono text-sm bg-muted p-2 rounded'>
                {transactionId}
              </p>
            </div>

            <Button
              onClick={checkPaymentStatus}
              className='w-full'
              disabled={checkingStatus}
            >
              {checkingStatus ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Checking...
                </>
              ) : (
                'Check Payment Status'
              )}
            </Button>

            {paymentStatus && (
              <Alert
                className={`${
                  paymentStatus === 'success'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : paymentStatus === 'failed'
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-yellow-50 border-yellow-500 text-yellow-700'
                }`}
              >
                <AlertTitle>
                  {paymentStatus === 'success'
                    ? 'Payment Successful'
                    : paymentStatus === 'failed'
                    ? 'Payment Failed'
                    : 'Payment Pending'}
                </AlertTitle>
                <AlertDescription>
                  {paymentStatus === 'success'
                    ? `KES ${amount} has been added to the account`
                    : paymentStatus === 'failed'
                    ? 'Your payment could not be processed'
                    : 'Your payment is still being processed'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              variant='outline'
              onClick={() => setShowResult(false)}
              className='w-full'
            >
              Make New Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MpesaPayment;
