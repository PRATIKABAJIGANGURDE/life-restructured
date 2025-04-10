
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressHistory } from "@/components/dashboard/ProgressHistory";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileBarChart, FileText, FileSpreadsheet, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ProgressHistoryItem {
  date: string;
  completionRate: number;
  tasksCompleted: number;
  totalTasks: number;
}

const Reports = () => {
  const [progressHistory, setProgressHistory] = useState<ProgressHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadProgressData = async () => {
      setIsLoading(true);
      try {
        // Try to load from Supabase first
        if (user?.id) {
          const { loadProgressHistory } = await import("@/services/progressService");
          const supabaseProgressHistory = await loadProgressHistory(user.id);
          
          if (supabaseProgressHistory && supabaseProgressHistory.length > 0) {
            setProgressHistory(supabaseProgressHistory);
            // Update localStorage with the latest data
            localStorage.setItem('progressHistory', JSON.stringify(supabaseProgressHistory));
            setIsLoading(false);
            return;
          }
        }
        
        // Fall back to localStorage
        const savedProgress = localStorage.getItem('progressHistory');
        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          setProgressHistory(parsedProgress);
        }
      } catch (error) {
        console.error("Error loading progress data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProgressData();
  }, [user]);

  const handleExportData = () => {
    try {
      if (progressHistory.length === 0) {
        toast({
          title: "No data to export",
          description: "You don't have any progress data to export yet.",
          variant: "destructive",
        });
        return;
      }
      
      // Format data for CSV
      const headers = ["Date", "Completion Rate", "Tasks Completed", "Total Tasks"];
      const dataRows = progressHistory.map(item => [
        new Date(item.date).toLocaleDateString(),
        `${item.completionRate.toFixed(2)}%`,
        item.tasksCompleted.toString(),
        item.totalTasks.toString()
      ]);
      
      const csvContent = [
        headers.join(","),
        ...dataRows.map(row => row.join(","))
      ].join("\n");
      
      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `progress-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report exported successfully",
        description: "Your progress data has been exported as a CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    toast({
      title: "Share feature coming soon",
      description: "The ability to share reports will be available in a future update.",
    });
  };
  
  return (
    <AppLayout>
      <div className="py-4 md:py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <FileBarChart className="h-6 w-6 text-primary" />
                Reports
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="weekly" className="space-y-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Weekly Report</span>
                <span className="sm:hidden">Weekly</span>
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center gap-2">
                <FileBarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Monthly Report</span>
                <span className="sm:hidden">Monthly</span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Custom Report</span>
                <span className="sm:hidden">Custom</span>
                <Badge variant="outline" className="ml-1 text-xs">New</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress Report</CardTitle>
                  <CardDescription>
                    View your progress over the past week
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ProgressChart progressHistory={progressHistory.filter(item => {
                    const itemDate = new Date(item.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return itemDate >= weekAgo;
                  })} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="monthly">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Progress Report</CardTitle>
                  <CardDescription>
                    View your progress over the past month
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ProgressChart progressHistory={progressHistory.filter(item => {
                    const itemDate = new Date(item.date);
                    const monthAgo = new Date();
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    return itemDate >= monthAgo;
                  })} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="custom">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Progress Report</CardTitle>
                  <CardDescription>
                    Visualize your progress history with custom views
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ProgressHistory progressHistory={progressHistory} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
