
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, PiggyBank, Zap } from 'lucide-react';

interface WithdrawDepositProps {
  onBack: () => void;
}

const WithdrawDeposit: React.FC<WithdrawDepositProps> = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+254');
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('deposit');
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const action = currentTab === 'deposit' ? 'deposited' : 'withdrawn';
      
      toast({
        title: `Successfully ${action}!`,
        description: `KES ${amount} has been ${action} ${currentTab === 'deposit' ? 'to' : 'from'} the account.`,
      });
      
      // Clear form
      setAmount('');
      
      // Return to dashboard
      if (currentTab === 'withdraw') {
        onBack();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: `Failed to ${currentTab}`,
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <Card>
        <CardHeader className={`${
          currentTab === 'deposit' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : 'bg-gradient-to-r from-amber-500 to-orange-500'
        } text-white`}>
          <CardTitle className="flex items-center">
            {currentTab === 'deposit' ? (
              <>
                <PiggyBank className="mr-2 h-5 w-5" />
                Deposit Funds
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Withdraw Funds
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs 
            defaultValue="deposit" 
            value={currentTab}
            onValueChange={setCurrentTab}
            className="mb-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            <TabsContent value="deposit" className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Deposit Kenyan Shillings via M-Pesa to convert to satoshis in your child's savings jar.
              </p>
            </TabsContent>
            <TabsContent value="withdraw" className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Withdraw funds from your child's savings jar back to your M-Pesa account.
              </p>
            </TabsContent>
          </Tabs>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                M-Pesa Phone Number
              </label>
              <Input
                id="phone"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+254712345678"
                required
              />
              <p className="text-xs text-gray-500">
                Enter the phone number registered with M-Pesa.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount (KES)
              </label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 100"
                required
                min="50"
                max="10000"
              />
              <p className="text-xs text-gray-500">
                Minimum: 50 KES, Maximum: 10,000 KES
              </p>
            </div>
            
            {currentTab === 'deposit' && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">You will receive:</h4>
                <div className="flex items-center justify-between">
                  <span>Satoshis:</span>
                  <span className="font-semibold text-amber-600">
                    {amount ? parseInt(amount) * 20 : 0} sats
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Approximate rate: 1 KES ≈ 20 satoshis
                </p>
              </div>
            )}
            
            <div className="pt-4">
              <Button
                type="submit"
                className={`w-full ${
                  currentTab === 'deposit'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading mr-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    {currentTab === 'deposit' ? (
                      <>
                        <PiggyBank className="mr-2 h-4 w-4" />
                        Deposit via M-Pesa
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Withdraw to M-Pesa
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WithdrawDeposit;
