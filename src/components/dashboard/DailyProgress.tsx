
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { updateMotivationalMessage } from "@/utils/aiUtils";
import { useToast } from "@/hooks/use-toast";

interface DailyProgressProps {
  completedTasksCount: number;
  totalTasks: number;
  motivationalMessage: string;
  editingMessage: boolean;
  setEditingMessage: (editing: boolean) => void;
  setMotivationalMessage: (message: string) => void;
  planData: any;
  userId?: string;
}

export const DailyProgress: React.FC<DailyProgressProps> = ({
  completedTasksCount,
  totalTasks,
  motivationalMessage,
  editingMessage,
  setEditingMessage,
  setMotivationalMessage,
  planData,
  userId
}) => {
  const { toast } = useToast();
  const progressPercentage = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;

  const handleSaveMessage = async () => {
    if (!userId) return;
    
    try {
      localStorage.setItem('userPlan', JSON.stringify({
        ...planData,
        motivationalMessage
      }));
      
      if (userId) {
        await updateMotivationalMessage(userId, motivationalMessage);
      }
      
      setEditingMessage(false);
      
      toast({
        title: "Success!",
        description: "Your motivational message has been updated",
      });
    } catch (error) {
      console.error('Error saving motivational message:', error);
      toast({
        title: "Failed to save message",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass">
      <CardContent className="py-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div>
            <h2 className="text-xl font-medium mb-2">Today's Progress</h2>
            <div className="flex items-center gap-2">
              <Progress 
                value={progressPercentage} 
                className="w-full max-w-md"
              />
              <span className="text-sm font-medium">{completedTasksCount}/{totalTasks}</span>
            </div>
          </div>
          <div className="glass p-4 rounded-xl border border-blue-100 relative">
            {editingMessage ? (
              <div className="space-y-2">
                <Input
                  value={motivationalMessage}
                  onChange={(e) => setMotivationalMessage(e.target.value)}
                  className="w-full text-sm"
                  placeholder="Enter your personal motivational message"
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setEditingMessage(false);
                      setMotivationalMessage(planData.motivationalMessage);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSaveMessage}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm italic text-muted-foreground pr-8">{motivationalMessage}</p>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => setEditingMessage(true)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
