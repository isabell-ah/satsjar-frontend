import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import GoalsManagement from '@/components/GoalsManagement';
import { useAuth } from '@/contexts/UserAuthContext';

const ChildGoalsPage = () => {
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
        <CardHeader>
          <CardTitle>Savings Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalsManagement childId={childId} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildGoalsPage;
