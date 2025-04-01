
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, RefreshCw, Loader } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ActionButtonsProps {
  isLoading: boolean;
  hasSchedule: boolean;
  resetDailyTasks: () => void;
  regeneratePlan: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isLoading,
  hasSchedule,
  resetDailyTasks,
  regeneratePlan,
}) => {
  return (
    <div className="mb-6 flex justify-end gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            disabled={isLoading || !hasSchedule}
          >
            <RefreshCcw className="h-4 w-4" />
            Reset Daily Tasks
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all daily tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all tasks as incomplete. Your progress history will be preserved.
              Note: Tasks are automatically reset at midnight each day.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetDailyTasks}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Button 
        onClick={regeneratePlan} 
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Generate New Plan
      </Button>
    </div>
  );
};
