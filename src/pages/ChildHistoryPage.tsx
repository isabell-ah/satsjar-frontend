import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/UserAuthContext';

const ChildHistoryPage = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleBackToDashboard = () => {
    // Check if we came from a parent viewing child dashboard
    if (location.state?.fromParentView || user?.role === 'parent') {
      // Navigate back to the child dashboard page (parent view)
      navigate(`/child-dashboard/${childId}`);
    } else {
      // Navigate back to main dashboard (child's own view)
      navigate('/');
    }
  };

  return (
    <div className='container max-w-md mx-auto p-4'>
      <Button
        variant='ghost'
        size='sm'
        className='mb-4'
        onClick={handleBackToDashboard}
      >
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the transaction history page for child ID: {childId}</p>
          <p className='text-muted-foreground mt-4'>
            This page is under construction. Check back soon for more features!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildHistoryPage;
