
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { TaskItem } from "./TaskItem";

interface ScheduleItem {
  time: string;
  task: string;
  completed: boolean;
  details?: string;
  mealSuggestions?: string[];
}

interface TaskListProps {
  schedule: ScheduleItem[];
  isLoading: boolean;
  expandedTaskIndex: number | null;
  toggleTaskExpansion: (index: number) => void;
  toggleTaskCompletion: (index: number) => void;
  regeneratePlan: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  schedule,
  isLoading,
  expandedTaskIndex,
  toggleTaskExpansion,
  toggleTaskCompletion,
  regeneratePlan,
}) => {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Your Daily Schedule</CardTitle>
        <CardDescription>
          Check off tasks as you complete them
        </CardDescription>
      </CardHeader>
      <CardContent>
        {schedule.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No schedule items yet. Generate a new plan to get started.</p>
            <Button 
              onClick={regeneratePlan}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Generate New Plan"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {schedule.map((item, index) => (
              <TaskItem
                key={index}
                item={item}
                index={index}
                expandedTaskIndex={expandedTaskIndex}
                toggleTaskExpansion={toggleTaskExpansion}
                toggleTaskCompletion={toggleTaskCompletion}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
