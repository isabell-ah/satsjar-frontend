import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddChildForm from '@/components/AddChildForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/UserAuthContext';

const AddChild = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect to home if not authenticated or not a parent
  React.useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'parent')) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className='container max-w-md mx-auto p-4'>
      <div className='mb-6'>
        <Button
          variant='ghost'
          size='sm'
          className='mb-4'
          onClick={() => navigate('/')}
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Dashboard
        </Button>
        <h1 className='text-2xl font-bold'>Add Child Account</h1>
        <p className='text-muted-foreground'>
          Create a new account for your child
        </p>
      </div>

      <AddChildForm />
    </div>
  );
};

export default AddChild;
