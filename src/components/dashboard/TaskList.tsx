
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { TaskItem } from "./TaskItem";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <Card className="glass">
      <CardHeader className={isMobile ? "px-3 py-4" : ""}>
        <CardTitle className={isMobile ? "text-lg" : ""}>Your Daily Schedule</CardTitle>
        <CardDescription>
          Check off tasks as you complete them
        </CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? "p-3 pt-0" : ""}>
        {schedule.length === 0 ? (
          <div className="text-center py-6 md:py-12">
            <p className="text-muted-foreground mb-4 text-sm md:text-base">No schedule items yet. Generate a new plan to get started.</p>
            <Button 
              onClick={regeneratePlan}
              disabled={isLoading}
              size={isMobile ? "sm" : "default"}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Generate New Plan"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5 md:space-y-2">
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
}
