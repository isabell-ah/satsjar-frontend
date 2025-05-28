import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Zap, ArrowLeft } from 'lucide-react';
import { walletApi } from '@/services/api';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/contexts/UserAuthContext';

interface LightningPaymentProps {
  onBack: () => void;
  onSuccess?: () => void;
  childId?: string;
}

const LightningPayment = ({
  onBack,
  onSuccess,
  childId,
}: LightningPaymentProps) => {
  const { toast } = useToast();
  const { user } = useAuth(); // Get current user context
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState('');
  const [paymentHash, setPaymentHash] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    'success' | 'failed' | 'pending' | null
  >(null);
  const [autoCheckInterval, setAutoCheckInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Add this function to handle back button click
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('LightningPayment: Back button clicked');
    if (typeof onBack === 'function') {
      onBack();
    } else {
      console.error('onBack is not a function:', onBack);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (autoCheckInterval) {
        clearInterval(autoCheckInterval);
      }
    };
  }, [autoCheckInterval]);

  // Start automatic payment checking when invoice is created
  const startAutoPaymentCheck = (hash: string) => {
    console.log('Starting automatic payment checking for:', hash);
    setCheckingStatus(true);
    setPaymentStatus('pending');

    // Clear any existing interval
    if (autoCheckInterval) {
      clearInterval(autoCheckInterval);
    }

    // Check immediately (but don't show manual check UI)
    // checkPaymentStatusManually(hash);

    // Then check every 3 seconds for up to 5 minutes
    let checkCount = 0;
    const maxChecks = 100; // 5 minutes at 3-second intervals

    const interval = setInterval(async () => {
      checkCount++;
      console.log(`Auto-check ${checkCount}/${maxChecks} for payment:`, hash);

      try {
        const result = await walletApi.checkInvoice(hash);

        if (result.paid) {
          console.log('Payment detected automatically!');
          setPaymentStatus('success');
          setCheckingStatus(false);
          clearInterval(interval);
          setAutoCheckInterval(null);

          toast({
            title: 'Payment Received! 🎉',
            description: `${result.amount} sats have been added to your account`,
          });

          if (onSuccess) onSuccess();
        } else if (checkCount >= maxChecks) {
          console.log('Auto-check timeout reached');
          setCheckingStatus(false);
          clearInterval(interval);
          setAutoCheckInterval(null);

          toast({
            title: 'Payment Check Timeout',
            description:
              'You can still check manually or the payment will be processed when received.',
          });
        }
      } catch (error) {
        console.error('Auto-check error:', error);
        if (checkCount >= maxChecks) {
          setCheckingStatus(false);
          clearInterval(interval);
          setAutoCheckInterval(null);
        }
      }
    }, 3000); // Check every 3 seconds

    setAutoCheckInterval(interval);
  };

  // Manual payment status check
  const checkPaymentStatusManually = async (hash: string) => {
    try {
      setCheckingStatus(true);
      const result = await walletApi.checkInvoice(hash);

      if (result.paid) {
        setPaymentStatus('success');
        toast({
          title: 'Payment Confirmed! 🎉',
          description: `${result.amount} sats have been added to your account`,
        });
        if (onSuccess) onSuccess();
      } else {
        setPaymentStatus('pending');
        toast({
          title: 'Payment not detected',
          description: 'The invoice has not been paid yet.',
        });
      }
    } catch (error) {
      console.error('Payment check error:', error);
      setPaymentStatus('failed');
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

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setLoading(true);

    try {
      console.log('Creating invoice with user context:', {
        userRole: user?.role,
        userId: user?.id,
        childId,
        amount: Number(amount),
        memo,
      });

      // Determine which endpoint to use based on USER ROLE, not childId presence
      const isParentCreatingForChild = user?.role === 'parent' && !!childId;
      const isChildCreatingForSelf = user?.role === 'child';

      let response;

      if (isParentCreatingForChild) {
        console.log('Parent creating invoice for child:', childId);
        response = await walletApi.createChildInvoice(
          childId!,
          Number(amount),
          memo || `Fund ${childId}'s account`
        );
      } else if (isChildCreatingForSelf) {
        console.log('Child creating invoice for themselves');
        response = await walletApi.createInvoice(
          Number(amount),
          memo || `Fund my account`
        );
      } else {
        // Fallback for other cases (admin, etc.)
        console.log('Using default invoice creation');
        response = await walletApi.createInvoice(
          Number(amount),
          memo || `Fund account`
        );
      }

      // Add console log to debug
      console.log('Invoice response:', response);

      // Make sure we're getting the payment request string
      if (!response.paymentRequest) {
        throw new Error('No payment request in response');
      }

      setInvoice(response.paymentRequest);
      setPaymentHash(response.paymentHash);
      setPaymentStatus(null);

      toast({
        title: 'Invoice Created',
        description:
          'Automatic payment detection started. Pay the invoice to continue.',
      });

      // Start automatic payment checking
      startAutoPaymentCheck(response.paymentHash);
    } catch (error) {
      console.error('Invoice creation error:', error);
      toast({
        variant: 'destructive',
        title: 'Error creating invoice',
        description:
          error instanceof Error ? error.message : "Couldn't create invoice",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='border-0 shadow-none'>
      <CardContent className='p-0'>
        <Button variant='ghost' onClick={handleBackClick} className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        {!invoice ? (
          <form onSubmit={handleCreateInvoice} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='amount'>Amount (sats)</Label>
              <Input
                id='amount'
                type='number'
                placeholder='Enter amount'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min='1'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='memo'>Memo (optional)</Label>
              <Input
                id='memo'
                placeholder='Add a note'
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
            <Button
              type='submit'
              className='w-full bg-orange-500 hover:bg-orange-600'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating Invoice...
                </>
              ) : (
                <>
                  <Zap className='mr-2 h-4 w-4' />
                  Create Invoice
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <div className='bg-white p-3 rounded-lg'>
                {invoice ? (
                  <>
                    <QRCodeSVG
                      value={invoice}
                      size={200}
                      level='M'
                      includeMargin={true}
                      bgColor={'#ffffff'}
                      fgColor={'#000000'}
                    />
                    {/* Add this for debugging */}
                    <p className='text-xs mt-2 text-center'>
                      Invoice length: {invoice.length}
                    </p>
                  </>
                ) : (
                  <div className='w-[200px] h-[200px] bg-gray-200 flex items-center justify-center'>
                    <p className='text-sm text-gray-500'>QR Code Placeholder</p>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Lightning Invoice</Label>
              <div className='relative'>
                <Input
                  value={invoice}
                  readOnly
                  className='pr-20 font-mono text-xs'
                />
                <Button
                  className='absolute right-1 top-1 h-7 px-2 text-xs'
                  onClick={() => {
                    navigator.clipboard.writeText(invoice);
                    toast({
                      title: 'Copied',
                      description: 'Invoice copied to clipboard',
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <Button
              onClick={() => checkPaymentStatusManually(paymentHash)}
              className='w-full'
              disabled={checkingStatus}
            >
              {checkingStatus ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {paymentStatus === 'pending'
                    ? 'Auto-checking...'
                    : 'Checking...'}
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
                    ? `${amount} sats have been added to the account`
                    : paymentStatus === 'failed'
                    ? 'Your payment could not be processed'
                    : 'Your payment is still being processed'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              variant='outline'
              onClick={() => {
                // Clear auto-check interval
                if (autoCheckInterval) {
                  clearInterval(autoCheckInterval);
                  setAutoCheckInterval(null);
                }

                // Reset form
                setInvoice('');
                setPaymentHash('');
                setPaymentStatus(null);
                setCheckingStatus(false);
              }}
              className='w-full'
            >
              Create New Invoice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LightningPayment;
