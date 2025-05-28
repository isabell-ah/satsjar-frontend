import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Phone, ArrowLeft } from 'lucide-react';
import MpesaPayment from './MpesaPayment';
import LightningPayment from './LightningPayment';

interface AddFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childId?: string;
  childName?: string;
  initialPaymentMethod?: 'lightning' | 'mpesa';
  onSuccess?: () => void;
}

const AddFundsModal = ({
  open,
  onOpenChange,
  childId,
  childName,
  initialPaymentMethod = 'lightning',
  onSuccess,
}: AddFundsModalProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'lightning' | 'mpesa'>(
    initialPaymentMethod
  );
  const [showPaymentOptions, setShowPaymentOptions] = useState(true);

  // Reset to payment options view when modal opens
  useEffect(() => {
    if (open) {
      setShowPaymentOptions(true);
    }
  }, [open]);

  // Handle back button from payment screens
  const handleBack = () => {
    setShowPaymentOptions(true);
  };

  // Handle payment method selection
  const handleSelectPaymentMethod = (method: 'lightning' | 'mpesa') => {
    setPaymentMethod(method);
    setShowPaymentOptions(false);
  };

  // Handle payment success
  const handlePaymentSuccess = (amount?: number) => {
    toast({
      title: 'Funds added',
      description: amount
        ? `${amount} sats added to ${childName || 'your'} account`
        : `Funds added to ${childName || 'your'} account`,
    });

    if (onSuccess) {
      onSuccess();
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Add funds to {childName || 'your'} savings jar
          </DialogDescription>
        </DialogHeader>

        {showPaymentOptions ? (
          <div className='space-y-4 py-4'>
            <div className='grid grid-cols-1 gap-4'>
              <Button
                variant='outline'
                className='flex items-center justify-start h-16 px-4'
                onClick={() => handleSelectPaymentMethod('lightning')}
              >
                <Wallet className='h-5 w-5 mr-3 text-amber-500' />
                <div className='text-left'>
                  <div className='font-medium'>Bitcoin</div>
                  <div className='text-sm text-muted-foreground'>
                    Pay with Lightning Network
                  </div>
                </div>
              </Button>

              <Button
                variant='outline'
                className='flex items-center justify-start h-16 px-4'
                onClick={() => handleSelectPaymentMethod('mpesa')}
              >
                <Phone className='h-5 w-5 mr-3 text-green-600' />
                <div className='text-left'>
                  <div className='font-medium'>M-Pesa</div>
                  <div className='text-sm text-muted-foreground'>
                    Pay with mobile money
                  </div>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <div className='space-y-4 py-4'>
            <Button
              variant='ghost'
              size='sm'
              className='mb-2'
              onClick={handleBack}
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to payment options
            </Button>

            {paymentMethod === 'lightning' ? (
              <LightningPayment
                childId={childId}
                onSuccess={handlePaymentSuccess}
                onBack={handleBack}
              />
            ) : (
              <MpesaPayment
                childId={childId}
                onSuccess={handlePaymentSuccess}
                onBack={handleBack}
              />
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant='ghost' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFundsModal;
