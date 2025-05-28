import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { UserPlus, UserMinus, Edit, ChevronRight, Coins } from 'lucide-react';
import { childrenApi } from '@/services/api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Child type definition
interface Child {
  id: string;
  jarId: string;
  name: string;
  balance: number;
  age?: number;
  pin?: string;
}

interface ManageChildrenProps {
  onBack: () => void;
  onFundChild: (childId: string) => void;
  onViewChildDashboard: (childId: string) => void;
  children?: Child[];
}

const ManageChildren = ({
  onBack,
  onFundChild,
  onViewChildDashboard,
  children = [],
}: ManageChildrenProps) => {
  const { toast } = useToast();
  const [localChildren, setLocalChildren] = useState<Child[]>(children);
  const [newChild, setNewChild] = useState({ name: '', age: '', pin: '' });
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    childId: '',
    childName: '',
    parentPin: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update local state when children prop changes
  useEffect(() => {
    setLocalChildren(children);
  }, [children]);

  // Fetch children data on component mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsLoading(true);
        const response = await childrenApi.getChildren();
        if (response && response.children) {
          setLocalChildren(response.children);
        }
      } catch (error) {
        console.error('Error fetching children:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load children data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, []);

  const handleAddChild = async () => {
    if (!newChild.name || !newChild.age || !newChild.pin) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const age = parseInt(newChild.age);
    if (isNaN(age) || age <= 0 || age > 17) {
      toast({
        title: 'Error',
        description: 'Age must be between 1 and 17',
        variant: 'destructive',
      });
      return;
    }

    if (newChild.pin.length !== 6 || !/^\d+$/.test(newChild.pin)) {
      toast({
        title: 'Error',
        description: 'PIN must be exactly 6 digits',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to add a child
      const response = await childrenApi.addChild({
        childName: newChild.name,
        childAge: age,
        childPin: newChild.pin,
      });

      // Add the new child to local state
      const newChildData: Child = {
        id: response.childId,
        jarId: response.jarId,
        name: newChild.name,
        age: age,
        balance: 0,
      };

      setLocalChildren([...localChildren, newChildData]);
      setNewChild({ name: '', age: '', pin: '' });

      toast({
        title: 'Success',
        description: `${newChild.name} has been added successfully`,
      });
    } catch (error) {
      console.error('Error adding child:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add child',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateChild = async () => {
    if (!editingChild || !editingChild.name) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const age = editingChild.age;
    if (age !== undefined && (isNaN(age) || age <= 0 || age > 17)) {
      toast({
        title: 'Error',
        description: 'Age must be between 1 and 17',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to update the child
      await childrenApi.updateChild(editingChild.id, {
        name: editingChild.name,
        age: editingChild.age,
      });

      // Update local state
      setLocalChildren(
        localChildren.map((child) =>
          child.id === editingChild.id ? editingChild : child
        )
      );

      toast({
        title: 'Success',
        description: 'Child information updated successfully',
      });
    } catch (error) {
      console.error('Error updating child:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update child',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteChild = async () => {
    if (!deleteConfirmation.parentPin) {
      toast({
        title: 'Error',
        description: 'Please enter your PIN to confirm deletion',
        variant: 'destructive',
      });
      return;
    }

    if (deleteConfirmation.parentPin.length < 4) {
      toast({
        title: 'Error',
        description: 'Please enter a valid PIN',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);

    try {
      // Call the API to delete the child
      await childrenApi.deleteChild(deleteConfirmation.childId);

      // Update local state
      setLocalChildren(
        localChildren.filter((child) => child.id !== deleteConfirmation.childId)
      );

      setDeleteConfirmation({
        open: false,
        childId: '',
        childName: '',
        parentPin: '',
      });

      toast({
        title: 'Child Deleted',
        description: 'The child account has been successfully deleted.',
      });

      // Force a refresh of the parent dashboard data
      if (typeof onRefreshData === 'function') {
        onRefreshData();
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete child. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteConfirmation = (childId: string, childName: string) => {
    setDeleteConfirmation({
      open: true,
      childId,
      childName,
      parentPin: '',
    });
  };

  // Log when onFundChild is called to debug
  const handleFundChild = (childId: string) => {
    console.log(
      'ManageChildren: handleFundChild called with childId:',
      childId
    );
    onFundChild(childId);
  };

  return (
    <TooltipProvider>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <Button variant='outline' onClick={onBack}>
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Manage Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='childName'>Child Name</Label>
                  <Input
                    id='childName'
                    value={newChild.name}
                    onChange={(e) =>
                      setNewChild({ ...newChild, name: e.target.value })
                    }
                    placeholder='Enter child name'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='childAge'>Child Age</Label>
                  <Input
                    id='childAge'
                    type='number'
                    min='1'
                    max='17'
                    value={newChild.age}
                    onChange={(e) =>
                      setNewChild({ ...newChild, age: e.target.value })
                    }
                    placeholder='Enter child age (1-17)'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='childPin'>Child PIN</Label>
                <Input
                  id='childPin'
                  type='password'
                  value={newChild.pin}
                  onChange={(e) =>
                    setNewChild({ ...newChild, pin: e.target.value })
                  }
                  placeholder='Create a 6-digit PIN for login'
                  maxLength={6}
                />
                <p className='text-xs text-muted-foreground'>
                  This PIN will be used by the child to login
                </p>
              </div>
              <Button onClick={handleAddChild} className='w-full mt-2'>
                Add Child
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center'>
              <Edit className='h-5 w-5 mr-2' />
              Manage Existing Children
            </CardTitle>
          </CardHeader>
          <CardContent>
            {localChildren.length === 0 ? (
              <div className='text-center py-4 text-muted-foreground'>
                No children added yet. Add your first child above.
              </div>
            ) : (
              <div className='space-y-4'>
                {localChildren.map((child) => (
                  <div
                    key={child.id}
                    className='flex items-center justify-between border-b pb-3 last:border-0 last:pb-0'
                  >
                    <div className='flex items-center'>
                      <div className='ml-3'>
                        {/* <p className='font-medium'>{child.name}</p> */}
                        <p className='text-xs text-muted-foreground'>
                          Jar ID: {child.jarId}{' '}
                          {/* {child.age && `• Age: ${child.age}`} */}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => setEditingChild(child)}
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                            </DialogTrigger>
                            <DialogContent aria-describedby={undefined}>
                              <DialogHeader>
                                <DialogTitle>Edit Child</DialogTitle>
                              </DialogHeader>
                              {editingChild && (
                                <div className='grid gap-4 py-4'>
                                  <div className='space-y-2'>
                                    <Label htmlFor='edit-name'>
                                      Child Name
                                    </Label>
                                    <Input
                                      id='edit-name'
                                      value={editingChild.name}
                                      onChange={(e) =>
                                        setEditingChild({
                                          ...editingChild,
                                          name: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className='space-y-2'>
                                    <Label htmlFor='edit-age'>Child Age</Label>
                                    <Input
                                      id='edit-age'
                                      type='number'
                                      min='1'
                                      max='17'
                                      value={editingChild.age || ''}
                                      onChange={(e) =>
                                        setEditingChild({
                                          ...editingChild,
                                          age:
                                            parseInt(e.target.value) ||
                                            undefined,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className='space-y-2'>
                                    <Label htmlFor='edit-jarId'>
                                      Jar ID (read-only)
                                    </Label>
                                    <Input
                                      id='edit-jarId'
                                      value={editingChild.jarId}
                                      disabled
                                      className='bg-gray-100 dark:bg-gray-800'
                                    />
                                    <p className='text-xs text-muted-foreground'>
                                      Jar ID cannot be changed as it is linked
                                      to the child's account
                                    </p>
                                  </div>
                                  <div className='space-y-2'>
                                    <Label htmlFor='edit-pin'>
                                      Child PIN (leave empty to keep current)
                                    </Label>
                                    <Input
                                      id='edit-pin'
                                      type='password'
                                      placeholder='New 6-digit PIN (optional)'
                                      onChange={(e) =>
                                        setEditingChild({
                                          ...editingChild,
                                          pin: e.target.value,
                                        })
                                      }
                                      maxLength={6}
                                    />
                                  </div>
                                  <div className='flex justify-end gap-2'>
                                    <DialogClose asChild>
                                      <Button variant='outline'>Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                      <Button onClick={handleUpdateChild}>
                                        Save Changes
                                      </Button>
                                    </DialogClose>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit {child.name}'s Profile</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='sm'
                            variant='outline'
                            className='bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30'
                            onClick={() =>
                              openDeleteConfirmation(child.id, child.name)
                            }
                          >
                            <UserMinus className='h-4 w-4 text-red-600 dark:text-red-400' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete {child.name}'s Account</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='sm'
                            variant='outline'
                            className='bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30'
                            onClick={() => handleFundChild(child.id)}
                          >
                            <Coins className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add Funds to {child.name}'s Jar</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='sm'
                            onClick={() => onViewChildDashboard(child.id)}
                            className='relative'
                          >
                            <ChevronRight className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View {child.name}'s Dashboard</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmation.open}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteConfirmation({
                open: false,
                childId: '',
                childName: '',
                parentPin: '',
              });
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {deleteConfirmation.childName}'s
                account? This action cannot be undone and will remove all
                associated data.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='parent-pin'>Enter your PIN to confirm</Label>
                <Input
                  id='parent-pin'
                  type='password'
                  placeholder='Your PIN'
                  value={deleteConfirmation.parentPin}
                  onChange={(e) =>
                    setDeleteConfirmation({
                      ...deleteConfirmation,
                      parentPin: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() =>
                  setDeleteConfirmation({
                    open: false,
                    childId: '',
                    childName: '',
                    parentPin: '',
                  })
                }
              >
                Cancel
              </Button>
              <Button variant='destructive' onClick={confirmDeleteChild}>
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ManageChildren;
