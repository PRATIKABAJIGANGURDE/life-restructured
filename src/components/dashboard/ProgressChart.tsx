
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProgressHistoryItem {
  date: string;
  completionRate: number;
  tasksCompleted: number;
  totalTasks: number;
}

interface ProgressChartProps {
  progressHistory: ProgressHistoryItem[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ progressHistory }) => {
  const isMobile = useIsMobile();
  
  const weeklyData = useMemo(() => {
    if (!progressHistory.length) return [];
    
    // Get the last 7 days including today
    const today = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today
    });
    
    // Map each day to completion data
    return last7Days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const matchingEntry = progressHistory.find(entry => {
        const entryDate = new Date(entry.date);
        return isSameDay(entryDate, day);
      });
      
      return {
        date: format(day, 'MMM dd'),
        completionRate: matchingEntry?.completionRate || 0,
        tasksCompleted: matchingEntry?.tasksCompleted || 0,
        totalTasks: matchingEntry?.totalTasks || 0,
      };
    });
  }, [progressHistory]);
  
  const monthlyData = useMemo(() => {
    if (!progressHistory.length) return [];
    
    // Get the last 30 days
    const today = new Date();
    const last30Days = eachDayOfInterval({
      start: subDays(today, 29),
      end: today
    });
    
    // Group by week
    const weeklyAverages: { [weekLabel: string]: { total: number, count: number, tasksCompleted: number, totalTasks: number } } = {};
    
    last30Days.forEach(day => {
      // Use week number as label
      const weekLabel = `Week ${Math.ceil((day.getDate()) / 7)}`;
      
      const matchingEntry = progressHistory.find(entry => {
        const entryDate = new Date(entry.date);
        return isSameDay(entryDate, day);
      });
      
      if (!weeklyAverages[weekLabel]) {
        weeklyAverages[weekLabel] = { total: 0, count: 0, tasksCompleted: 0, totalTasks: 0 };
      }
      
      const avg = weeklyAverages[weekLabel];
      
      if (matchingEntry) {
        avg.total += matchingEntry.completionRate;
        avg.tasksCompleted += matchingEntry.tasksCompleted;
        avg.totalTasks += matchingEntry.totalTasks;
      }
      
      avg.count += 1;
    });
    
    // Convert to array and calculate averages
    return Object.entries(weeklyAverages).map(([weekLabel, data]) => ({
      date: weekLabel,
      completionRate: data.count > 0 ? Math.round(data.total / data.count) : 0,
      tasksCompleted: data.tasksCompleted,
      totalTasks: data.totalTasks
    }));
  }, [progressHistory]);
  
  const chartConfig = {
    completionRate: {
      label: "Completion Rate",
      theme: {
        light: "#3B82F6",
        dark: "#60A5FA"
      }
    },
    tasksCompleted: {
      label: "Tasks Completed",
      theme: {
        light: "#10B981",
        dark: "#34D399"
      }
    }
  };
  
  if (progressHistory.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Progress Analytics</CardTitle>
          <CardDescription>Visualize your task completion over time</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-center text-muted-foreground">
            No progress data available. Complete daily tasks to start tracking your progress.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Progress Analytics</CardTitle>
        <CardDescription>Visualize your task completion over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList>
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-4">
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="completionRate" name="Completion Rate" fill="var(--color-completionRate)" barSize={isMobile ? 15 : 30} />
                </BarChart>
              </ChartContainer>
            </div>
            
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tasksCompleted" 
                    name="Tasks Completed" 
                    stroke="var(--color-tasksCompleted)" 
                    strokeWidth={2} 
                    dot={{ stroke: 'var(--color-tasksCompleted)', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="completionRate" name="Completion Rate" fill="var(--color-completionRate)" barSize={isMobile ? 15 : 30} />
                </BarChart>
              </ChartContainer>
            </div>
            
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tasksCompleted" 
                    name="Tasks Completed" 
                    stroke="var(--color-tasksCompleted)" 
                    strokeWidth={2} 
                    dot={{ stroke: 'var(--color-tasksCompleted)', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
