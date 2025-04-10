
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { BarChart, Calendar, Settings, CreditCard, RefreshCw, RotateCcw, FileBarChart, Loader } from 'lucide-react';

interface ActionButtonsProps {
  isLoading?: boolean;
  hasSchedule?: boolean;
  resetDailyTasks?: () => void;
  regeneratePlan?: (userInputs?: any) => Promise<void>;
}

export const ActionButtons = ({ 
  isLoading = false, 
  hasSchedule = false,
  resetDailyTasks,
  regeneratePlan 
}: ActionButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
      <Button 
        variant="outline" 
        className="flex flex-col items-center justify-center h-24 space-y-2"
        onClick={() => navigate('/progress-analytics')}
      >
        <BarChart className="h-6 w-6" />
        <span>Analytics</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex flex-col items-center justify-center h-24 space-y-2"
        onClick={() => navigate('/reports')}
      >
        <FileBarChart className="h-6 w-6" />
        <span>Reports</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex flex-col items-center justify-center h-24 space-y-2"
        onClick={() => navigate('/settings')}
      >
        <Settings className="h-6 w-6" />
        <span>Settings</span>
      </Button>

      <Button 
        variant="outline" 
        className="flex flex-col items-center justify-center h-24 space-y-2"
        onClick={() => navigate('/pricing')}
      >
        <CreditCard className="h-6 w-6" />
        <span>Premium</span>
      </Button>
    </div>
  );
};
