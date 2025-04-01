
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressHistoryItem {
  date: string;
  completionRate: number;
  tasksCompleted: number;
  totalTasks: number;
}

interface ProgressHistoryProps {
  progressHistory: ProgressHistoryItem[];
}

export const ProgressHistory: React.FC<ProgressHistoryProps> = ({
  progressHistory,
}) => {
  const last7DaysProgress = progressHistory.slice(0, 7).reverse();

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
        <CardDescription>
          Track your journey over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {progressHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No progress data yet. Complete tasks in your daily schedule to start tracking progress.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium mb-3">Last 7 Days Completion Rate</h3>
              <div className="grid grid-cols-7 gap-2 max-w-2xl">
                {last7DaysProgress.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                      <div 
                        className="absolute bottom-0 w-full bg-primary"
                        style={{ height: `${day.completionRate}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-xs font-medium">{Math.round(day.completionRate)}%</div>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 7 - last7DaysProgress.length) }).map((_, index) => (
                  <div key={`empty-${index}`} className="flex flex-col items-center">
                    <div className="w-full h-32 bg-gray-100 rounded-md"></div>
                    <div className="text-xs mt-1 text-muted-foreground">-</div>
                    <div className="text-xs font-medium">0%</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-3">Progress History</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {progressHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                      <div className="text-sm text-muted-foreground">Completed {entry.tasksCompleted} of {entry.totalTasks} tasks</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={entry.completionRate} 
                        className="w-24"
                      />
                      <span className="text-sm font-medium">{Math.round(entry.completionRate)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
