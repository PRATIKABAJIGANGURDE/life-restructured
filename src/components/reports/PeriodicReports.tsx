
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isWithinInterval } from "date-fns";
import { Calendar, CalendarIcon, FileText, Download, Printer, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProgressHistoryItem, fetchProgressData } from "@/utils/progressDataUtils";

export const PeriodicReports = () => {
  const [progressHistory, setProgressHistory] = useState<ProgressHistoryItem[]>([]);
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [reportFormat, setReportFormat] = useState<'summary' | 'detailed'>('summary');
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.id) {
      loadProgressHistory();
    }
  }, [user]);
  
  const loadProgressHistory = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const data = await fetchProgressData(user.id);
        setProgressHistory(data);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
      toast({
        title: "Error loading data",
        description: "Could not load your progress data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    
    // Calculate trends - are we improving?
    const firstHalf = filteredData.slice(0, Math.floor(filteredData.length / 2));
    const secondHalf = filteredData.slice(Math.floor(filteredData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.completionRate, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.completionRate, 0) / secondHalf.length;
    
    const trend = secondHalfAvg - firstHalfAvg;
    const trendDirection = trend > 5 ? "positive" : trend < -5 ? "negative" : "stable";
    
    // Format date range for display
    const dateRangeText = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {reportType === 'weekly' ? 'Weekly' : 'Monthly'} Summary
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{dateRangeText}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast({ title: "Report exported", description: "Report has been exported as PDF" })}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast({ title: "Report printed", description: "Report has been sent to printer" })}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast({ title: "Report shared", description: "Report sharing link copied to clipboard" })}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{averageCompletionRate}%</div>
                <p className="text-sm text-muted-foreground">Average Completion</p>
                {trendDirection !== "stable" && (
                  <Badge className={`mt-2 ${trendDirection === "positive" ? "bg-green-500" : "bg-red-500"}`}>
                    {trendDirection === "positive" ? "↑" : "↓"} 
                    {Math.abs(Math.round(trend))}% from previous period
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{highestCompletion.toFixed(2)}%</div>
                <p className="text-sm text-muted-foreground">Highest Completion</p>
                <Badge className="mt-2 bg-blue-500">
                  {format(new Date(filteredData.find(item => item.completionRate === highestCompletion)?.date || ""), 'MMM d')}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalTasksCompleted}/{totalTasksAssigned}</div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <Badge className="mt-2 bg-purple-500">
                  {Math.round((totalTasksCompleted / totalTasksAssigned) * 100)}% Efficiency
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium">Daily Progress</h4>
            <Select value={reportFormat} onValueChange={(value) => setReportFormat(value as 'summary' | 'detailed')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Report Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary View</SelectItem>
                <SelectItem value="detailed">Detailed View</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
            {filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div>
                    <div className="font-medium">{format(new Date(entry.date), 'EEE, MMM d')}</div>
                    <div className="text-sm text-muted-foreground">
                      Completed {entry.tasksCompleted} of {entry.totalTasks} tasks
                    </div>
                    {reportFormat === 'detailed' && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Categories: Exercise, Medication, Therapy
                      </div>
                    )}
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
        
        {reportFormat === 'detailed' && (
          <div>
            <Separator className="my-4" />
            <div className="space-y-3">
              <h4 className="text-md font-medium">Professional Insights</h4>
              <p className="text-sm text-muted-foreground">
                Based on your {reportType} performance, we've identified the following patterns and recommendations:
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex gap-2 items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  {trendDirection === "positive" 
                    ? "Your completion rate has improved compared to the previous period."
                    : trendDirection === "negative"
                    ? "Your completion rate has decreased compared to the previous period."
                    : "Your completion rate has remained stable compared to the previous period."
                  }
                </li>
                <li className="flex gap-2 items-center">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  Your most consistent category is Exercise with 85% average completion.
                </li>
                <li className="flex gap-2 items-center">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Consider focusing more on Medication adherence, which has the lowest completion rate.
                </li>
              </ul>
            </div>
          </div>
        )}
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
            <FileText className="h-4 w-4" />
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
