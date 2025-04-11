
import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { PeriodicReports } from "@/components/reports/PeriodicReports";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProgressData, ProgressHistoryItem } from "@/utils/progressDataUtils";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ProgressDashboard: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const data = await fetchProgressData(user.id);
        setProgressData(data);
      } catch (error) {
        console.error("Error loading progress data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Progress Dashboard</h1>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <ProgressChart progressHistory={progressData} />
          <PeriodicReports />
        </div>
      </div>
    </AppLayout>
  );
};

export default ProgressDashboard;
