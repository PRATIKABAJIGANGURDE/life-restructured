
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { format, isToday, isSameMonth } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { DayProps } from "react-day-picker";

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
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const isMobile = useIsMobile();

  // Function to determine circle color based on completion rate
  const getCompletionColor = (completion: number) => {
    if (completion >= 80) return "bg-green-500";
    if (completion >= 50) return "bg-yellow-500";
    if (completion >= 20) return "bg-orange-500";
    if (completion > 0) return "bg-red-400";
    return "bg-gray-200";
  };

  // Create a map of dates with progress data
  const progressByDate = progressHistory.reduce<Record<string, ProgressHistoryItem>>((acc, entry) => {
    const dateString = entry.date.split('T')[0];
    acc[dateString] = entry;
    return acc;
  }, {});

  // Filter progress history for the currently selected month
  const currentMonthProgress = progressHistory.filter(entry => {
    const entryDate = new Date(entry.date);
    return isSameMonth(entryDate, currentMonth);
  });

  // Custom renderer for calendar dates
  const renderDay = (props: DayProps) => {
    const { date, ...rest } = props;
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasProgress = dateStr in progressByDate;
    const progressData = hasProgress ? progressByDate[dateStr] : null;
    
    return (
      <div className="relative flex h-9 w-9 items-center justify-center p-0">
        {hasProgress && (
          <div 
            className={`absolute inset-0 rounded-full ${getCompletionColor(progressData!.completionRate)} opacity-20`}
            aria-hidden="true"
          />
        )}
        <span 
          className={`z-10 ${isToday(date) ? 'font-bold' : ''} ${hasProgress ? 'text-foreground' : 'text-muted-foreground'}`}
        >
          {date.getDate()}
        </span>
        {hasProgress && progressData!.completionRate >= 80 && (
          <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
        )}
      </div>
    );
  };

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
              <h3 className="text-md font-medium mb-3">Monthly Activity</h3>
              <div className="flex justify-center mb-6">
                <Calendar
                  mode="default"
                  defaultMonth={currentMonth}
                  onMonthChange={setCurrentMonth}
                  selected={[]}
                  className="rounded-md border"
                  components={{
                    Day: renderDay
                  }}
                />
              </div>
              
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>80-100%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span>50-79%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  <span>20-49%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <span>1-19%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-3">Progress History</h3>
              <div className={`space-y-2 ${isMobile ? "max-h-60" : "max-h-80"} overflow-y-auto pr-2`}>
                {currentMonthProgress.map((entry, index) => (
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
