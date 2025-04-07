
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { format, isToday, isSameMonth, startOfMonth } from "date-fns";
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

  // Function to determine dot color based on completion rate
  const getDotColorClass = (completion: number) => {
    if (completion >= 80) return "bg-green-500";
    if (completion >= 50) return "bg-yellow-500";
    if (completion >= 1) return "bg-orange-500";
    return "bg-gray-300";
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
    const progressData = progressByDate[dateStr];
    
    return (
      <div className="relative flex h-full w-full items-center justify-center p-0">
        <span className={`${isToday(date) ? 'font-bold' : ''}`}>
          {date.getDate()}
        </span>
        {hasProgress && (
          <div 
            className={`absolute -bottom-1 h-1.5 w-1.5 rounded-full ${getDotColorClass(progressData.completionRate)}`}
            title={`${Math.round(progressData.completionRate)}% completed`}
          />
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
              <div className="flex justify-center mb-4">
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

