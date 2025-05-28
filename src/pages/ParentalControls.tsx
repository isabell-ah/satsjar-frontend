import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Lock, Bell, Filter, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/UserAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

const ParentalControls = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [childPin, setChildPin] = useState('');
  const [parentPin, setParentPin] = useState('');
  const [confirmParentPin, setConfirmParentPin] = useState('');
  const [notifications, setNotifications] = useState({
    sms: true,
    inApp: true,
    email: false,
  });
  const [contentFilters, setContentFilters] = useState({
    ageAppropriate: true,
    hideAdvancedConcepts: true,
    parentApproval: false,
  });
  const [withdrawalSettings, setWithdrawalSettings] = useState({
    requireApproval: true,
    maxWithdrawal: '500',
    allowEmergency: false,
  });

  const handleSavePin = (type: 'parent' | 'child') => {
    if (type === 'parent' && parentPin !== confirmParentPin) {
      toast({
        variant: 'destructive',
        title: "PINs don't match",
        description: 'Please make sure your new PIN and confirmation match.',
      });
      return;
    }

    toast({
      title: 'PIN Updated',
      description: `${
        type === 'parent' ? 'Parent' : 'Child'
      } PIN has been updated successfully.`,
    });
  };

  const handleSaveSettings = (settingType: string) => {
    toast({
      title: 'Settings Saved',
      description: `Your ${settingType} settings have been updated successfully.`,
    });
  };

  useEffect(() => {
    // Check if user is authenticated and is a parent
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to access this page.',
      });
      navigate('/');
      return;
    }

    if (user.role !== 'parent') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You must be logged in as a parent to access this page.',
      });
      navigate('/');
      return;
    }
  }, [user, navigate, toast]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-gray-50 dark:from-background dark:to-gray-900 transition-colors duration-300'>
      <div className='max-w-3xl mx-auto p-4'>
        <header className='flex items-center justify-between mb-6'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              onClick={() => navigate('/')}
              className='mr-2'
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <h1 className='text-2xl font-bold'>Parental Controls</h1>
          </div>
          <ThemeToggle />
        </header>

        <Tabs defaultValue='pin' className='space-y-4'>
          <TabsList className='grid grid-cols-4'>
            <TabsTrigger value='pin'>PIN Security</TabsTrigger>
            <TabsTrigger value='withdrawals'>Withdrawals</TabsTrigger>
            <TabsTrigger value='notifications'>Notifications</TabsTrigger>
            <TabsTrigger value='content'>Content Filters</TabsTrigger>
          </TabsList>

          <TabsContent value='pin' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Lock className='mr-2 h-5 w-5' />
                  PIN Management
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-3'>
                  <h3 className='font-medium'>Update Parent PIN</h3>
                  <div className='space-y-2'>
                    <Label htmlFor='parent-pin'>New Parent PIN</Label>
                    <Input
                      id='parent-pin'
                      type='password'
                      maxLength={4}
                      value={parentPin}
                      onChange={(e) => setParentPin(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='confirm-parent-pin'>Confirm New PIN</Label>
                    <Input
                      id='confirm-parent-pin'
                      type='password'
                      maxLength={4}
                      value={confirmParentPin}
                      onChange={(e) => setConfirmParentPin(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => handleSavePin('parent')}>
                    Update Parent PIN
                  </Button>
                </div>

                <div className='space-y-3 pt-4 border-t'>
                  <h3 className='font-medium'>Update Child PIN</h3>
                  <div className='space-y-2'>
                    <Label htmlFor='child-pin'>New Child PIN</Label>
                    <Input
                      id='child-pin'
                      type='password'
                      maxLength={4}
                      value={childPin}
                      onChange={(e) => setChildPin(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => handleSavePin('child')}>
                    Update Child PIN
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='withdrawals' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Shield className='mr-2 h-5 w-5' />
                  Withdrawal Settings
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='require-approval'>
                      Require Parent Approval
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      All withdrawals will need your approval
                    </p>
                  </div>
                  <Switch
                    id='require-approval'
                    checked={withdrawalSettings.requireApproval}
                    onCheckedChange={(checked) =>
                      setWithdrawalSettings({
                        ...withdrawalSettings,
                        requireApproval: checked,
                      })
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='max-withdrawal'>
                    Maximum Withdrawal (sats)
                  </Label>
                  <Input
                    id='max-withdrawal'
                    type='number'
                    value={withdrawalSettings.maxWithdrawal}
                    onChange={(e) =>
                      setWithdrawalSettings({
                        ...withdrawalSettings,
                        maxWithdrawal: e.target.value,
                      })
                    }
                  />
                  <p className='text-sm text-muted-foreground'>
                    Maximum amount that can be withdrawn without approval
                  </p>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='allow-emergency'>
                      Emergency Withdrawals
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Allow emergency withdrawals by child
                    </p>
                  </div>
                  <Switch
                    id='allow-emergency'
                    checked={withdrawalSettings.allowEmergency}
                    onCheckedChange={(checked) =>
                      setWithdrawalSettings({
                        ...withdrawalSettings,
                        allowEmergency: checked,
                      })
                    }
                  />
                </div>

                <Button
                  onClick={() => handleSaveSettings('withdrawal')}
                  className='mt-4'
                >
                  Save Withdrawal Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='notifications' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Bell className='mr-2 h-5 w-5' />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='sms-notifications'>SMS Notifications</Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive updates via SMS
                    </p>
                  </div>
                  <Switch
                    id='sms-notifications'
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, sms: checked })
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='in-app-notifications'>
                      In-App Notifications
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive updates within the app
                    </p>
                  </div>
                  <Switch
                    id='in-app-notifications'
                    checked={notifications.inApp}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, inApp: checked })
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='email-notifications'>
                      Email Notifications
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    id='email-notifications'
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <Button
                  onClick={() => handleSaveSettings('notification')}
                  className='mt-4'
                >
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='content' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Filter className='mr-2 h-5 w-5' />
                  Content Filtering
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='age-appropriate'>
                      Age-Appropriate Content
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Only show content suitable for your child's age
                    </p>
                  </div>
                  <Switch
                    id='age-appropriate'
                    checked={contentFilters.ageAppropriate}
                    onCheckedChange={(checked) =>
                      setContentFilters({
                        ...contentFilters,
                        ageAppropriate: checked,
                      })
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='hide-advanced'>
                      Hide Advanced Concepts
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Hide complex Bitcoin concepts
                    </p>
                  </div>
                  <Switch
                    id='hide-advanced'
                    checked={contentFilters.hideAdvancedConcepts}
                    onCheckedChange={(checked) =>
                      setContentFilters({
                        ...contentFilters,
                        hideAdvancedConcepts: checked,
                      })
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='parent-approval'>
                      Require Parent Approval
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Approve all content before child can view
                    </p>
                  </div>
                  <Switch
                    id='parent-approval'
                    checked={contentFilters.parentApproval}
                    onCheckedChange={(checked) =>
                      setContentFilters({
                        ...contentFilters,
                        parentApproval: checked,
                      })
                    }
                  />
                </div>

                <Button
                  onClick={() => handleSaveSettings('content filtering')}
                  className='mt-4'
                >
                  Save Content Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentalControls;
