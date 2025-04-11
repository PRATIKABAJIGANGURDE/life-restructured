
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ArrowLeft, BarChart, ChartPie, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProgressHistoryItem, fetchProgressData } from "@/utils/progressDataUtils";

const ProgressAnalytics = () => {
  const [progressHistory, setProgressHistory] = useState<ProgressHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const loadProgressData = async () => {
      setIsLoading(true);
      try {
        if (user?.id) {
          const data = await fetchProgressData(user.id);
          setProgressHistory(data);
        }
      } catch (error) {
        console.error("Error loading progress data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProgressData();
  }, [user]);
  
  // Calculate statistics
  const calculateStats = () => {
    if (!progressHistory.length) {
      return { 
        averageCompletionRate: 0, 
        highestCompletionRate: 0, 
        totalTasksCompleted: 0,
        streakDays: 0
      };
    }
    
    let totalCompletionRate = 0;
    let highestCompletionRate = 0;
    let totalTasksCompleted = 0;
    let streakDays = 0;
    let currentStreak = 0;
    
    // Sort by date (newest first) for streak calculation
    const sortedHistory = [...progressHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    sortedHistory.forEach((day, index) => {
      totalCompletionRate += day.completionRate;
      totalTasksCompleted += day.tasksCompleted;
      
      if (day.completionRate > highestCompletionRate) {
        highestCompletionRate = day.completionRate;
      }
      
      // Calculate streak (days with at least 1 task completed)
      if (day.tasksCompleted > 0) {
        if (index === 0) {
          currentStreak = 1;
        } else {
          const prevDate = new Date(sortedHistory[index-1].date);
          const currDate = new Date(day.date);
          
          // Check if dates are consecutive
          const diffTime = Math.abs(prevDate.getTime() - currDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak++;
          } else {
            // Break in the streak
            if (currentStreak > streakDays) {
              streakDays = currentStreak;
            }
            currentStreak = 1;
          }
        }
      } else if (currentStreak > streakDays) {
        // End of records, update streak if current is higher
        streakDays = currentStreak;
        currentStreak = 0;
      }
    });
    
    // Check if current streak is the highest
    if (currentStreak > streakDays) {
      streakDays = currentStreak;
    }
    
    return {
      averageCompletionRate: Math.round(totalCompletionRate / progressHistory.length),
      highestCompletionRate,
      totalTasksCompleted,
      streakDays
    };
  };
  
  const stats = calculateStats();
  
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
      <div className="py-4 md:py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <BarChart className="h-6 w-6 text-primary" />
              Progress Analytics
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-sm">Average Completion Rate</span>
                  <span className="text-3xl font-bold text-primary mt-2">{stats.averageCompletionRate}%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-sm">Highest Completion Rate</span>
                  <span className="text-3xl font-bold text-green-500 mt-2">{stats.highestCompletionRate.toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-sm">Total Tasks Completed</span>
                  <span className="text-3xl font-bold text-blue-500 mt-2">{stats.totalTasksCompleted}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-sm">Current Streak</span>
                  <span className="text-3xl font-bold text-orange-500 mt-2">{stats.streakDays} days</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-8">
            <ProgressChart progressHistory={progressHistory} />
          </div>
          
          <Card className="glass">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-medium mb-4">Detailed Progress History</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Tasks Completed</TableHead>
                      <TableHead>Total Tasks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progressHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          No progress data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      progressHistory.slice().sort((a, b) => 
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                      ).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(item.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>{Math.round(item.completionRate)}%</TableCell>
                          <TableCell>{item.tasksCompleted}</TableCell>
                          <TableCell>{item.totalTasks}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProgressAnalytics;
