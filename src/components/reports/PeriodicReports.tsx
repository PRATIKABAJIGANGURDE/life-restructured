
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isWithinInterval } from "date-fns";
import { Calendar, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

interface ProgressHistoryItem {
  date: string;
  completionRate: number;
  tasksCompleted: number;
  totalTasks: number;
}

export const PeriodicReports = () => {
  const [progressHistory, setProgressHistory] = useState<ProgressHistoryItem[]>([]);
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    loadProgressHistory();
  }, [user]);
  
  const loadProgressHistory = () => {
    const storedData = localStorage.getItem('progressHistory');
    if (storedData) {
      setProgressHistory(JSON.parse(storedData));
    }
  };
  
  const generateReport = async () => {
    setLoading(true);
    
    try {
      // Get the date range based on report type
      const today = new Date();
      let startDate, endDate;
      
      if (reportType === 'weekly') {
        startDate = startOfWeek(today, { weekStartsOn: 1 });
        endDate = endOfWeek(today, { weekStartsOn: 1 });
      } else {
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
      }
      
      // Filter progress data within the selected date range
      const filteredData = progressHistory.filter(entry => {
        const entryDate = new Date(entry.date);
        return isWithinInterval(entryDate, { start: startDate, end: endDate });
      });
      
      if (filteredData.length === 0) {
        toast({
          title: "No data available",
          description: `No progress data found for the selected ${reportType} period.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Calculate statistics
      const totalCompletionRate = filteredData.reduce((sum, item) => sum + item.completionRate, 0);
      const averageCompletionRate = Math.round(totalCompletionRate / filteredData.length);
      const highestCompletion = Math.max(...filteredData.map(item => item.completionRate));
      
      // Calculate total tasks completed
      const totalTasksCompleted = filteredData.reduce((sum, item) => sum + item.tasksCompleted, 0);
      const totalTasksAssigned = filteredData.reduce((sum, item) => sum + item.totalTasks, 0);
      
      // Format date range for display
      const dateRangeText = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      
      toast({
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report Generated`,
        description: `Report for ${dateRangeText} is ready to view.`,
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error generating report",
        description: "There was a problem generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const renderReportSummary = () => {
    const today = new Date();
    let startDate, endDate;
    
    if (reportType === 'weekly') {
      startDate = startOfWeek(today, { weekStartsOn: 1 });
      endDate = endOfWeek(today, { weekStartsOn: 1 });
    } else {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
    }
    
    // Filter progress data within the selected date range
    const filteredData = progressHistory.filter(entry => {
      const entryDate = new Date(entry.date);
      return isWithinInterval(entryDate, { start: startDate, end: endDate });
    });
    
    if (filteredData.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No data available for this period.</p>
        </div>
      );
    }
    
    // Calculate statistics
    const totalCompletionRate = filteredData.reduce((sum, item) => sum + item.completionRate, 0);
    const averageCompletionRate = Math.round(totalCompletionRate / filteredData.length);
    const highestCompletion = Math.max(...filteredData.map(item => item.completionRate));
    
    // Calculate total tasks completed
    const totalTasksCompleted = filteredData.reduce((sum, item) => sum + item.tasksCompleted, 0);
    const totalTasksAssigned = filteredData.reduce((sum, item) => sum + item.totalTasks, 0);
    
    // Format date range for display
    const dateRangeText = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {reportType === 'weekly' ? 'Weekly' : 'Monthly'} Summary
          </h3>
          <Badge variant="outline">{dateRangeText}</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{averageCompletionRate}%</div>
                <p className="text-sm text-muted-foreground">Average Completion</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{highestCompletion}%</div>
                <p className="text-sm text-muted-foreground">Highest Completion</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalTasksCompleted}/{totalTasksAssigned}</div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-md font-medium">Daily Progress</h4>
          {filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div>
                  <div className="font-medium">{format(new Date(entry.date), 'EEE, MMM d')}</div>
                  <div className="text-sm text-muted-foreground">
                    Completed {entry.tasksCompleted} of {entry.totalTasks} tasks
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={entry.completionRate} className="w-24" />
                  <span className="text-sm font-medium">
                    {Math.round(entry.completionRate)}%
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Periodic Reports</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateReport} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Generate Report
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" onValueChange={(value) => setReportType(value as 'weekly' | 'monthly')}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly">
            {renderReportSummary()}
          </TabsContent>
          
          <TabsContent value="monthly">
            {renderReportSummary()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
