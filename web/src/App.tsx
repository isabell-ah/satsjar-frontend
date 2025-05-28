import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserAuthProvider } from './contexts/UserAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import ParentalControls from './pages/ParentalControls';
import About from './pages/About';
import AddChild from './pages/AddChild';
import ChildDashboardPage from './pages/ChildDashboardPage';
import ChildGoalsPage from './pages/ChildGoalsPage';
import ChildLearningPage from './pages/ChildLearningPage';
import ChildHistoryPage from './pages/ChildHistoryPage';
import ChildAchievementsPage from './pages/ChildAchievementsPage';
import ErrorBoundary from '@/components/ErrorBoundary';

// Create a new query client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <UserAuthProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path='/' element={<Index />} />
                <Route
                  path='/parental-controls'
                  element={<ParentalControls />}
                />
                <Route path='/about' element={<About />} />
                <Route path='/add-child' element={<AddChild />} />
                <Route
                  path='/child-dashboard/:childId'
                  element={<ChildDashboardPage />}
                />
                <Route
                  path='/child-dashboard/:childId/goals'
                  element={<ChildGoalsPage />}
                />
                <Route
                  path='/child-dashboard/:childId/learning'
                  element={<ChildLearningPage />}
                />
                <Route
                  path='/child-dashboard/:childId/history'
                  element={<ChildHistoryPage />}
                />
                <Route
                  path='/child-dashboard/:childId/achievements'
                  element={<ChildAchievementsPage />}
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path='*' element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </UserAuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
