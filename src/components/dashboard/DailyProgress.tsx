
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, BarChart, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { saveDailyProgress } from "@/services/progressService";

interface DailyProgressProps {
  completedTasksCount: number;
  totalTasks: number;
  motivationalMessage: string;
  editingMessage: boolean;
  setEditingMessage: (value: boolean) => void;
  setMotivationalMessage: (value: string) => void;
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
  const [message, setMessage] = useState(motivationalMessage);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    setMessage(motivationalMessage);
  }, [motivationalMessage]);

  const completionRate = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;

  const handleSaveMessage = async () => {
    if (!userId) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to save your motivational message.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_data: { ...planData, motivationalMessage: message } })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setMotivationalMessage(message);
      setEditingMessage(false);

      // Update local storage
      const storedPlan = localStorage.getItem('userPlan');
      if (storedPlan) {
        const updatedPlan = { ...JSON.parse(storedPlan), motivationalMessage: message };
        localStorage.setItem('userPlan', JSON.stringify(updatedPlan));
      }

      toast({
        title: "Message saved",
        description: "Your motivational message has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Save progress to Supabase
  useEffect(() => {
    const saveProgress = async () => {
      if (!userId || totalTasks <= 0) return;
      
      try {
        const today = new Date();
        const progressData = {
          date: today.toISOString(),
          completionRate: completionRate,
          tasksCompleted: completedTasksCount,
          totalTasks: totalTasks
        };
        
        await saveDailyProgress(userId, progressData);
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    };
    
    saveProgress();
  }, [completedTasksCount, totalTasks, userId, completionRate]);
  
  return (
    <Card className="glass transition-all">
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-2 md:mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-medium mb-1">Daily Progress</h3>
            <p className="text-sm text-muted-foreground">
              {completedTasksCount} of {totalTasks} tasks completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/integration">
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline">Reports & Calendar</span>
                <span className="md:hidden">Integrations</span>
              </Button>
            </Link>
            <Link to="/progress-analytics">
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                className="flex items-center gap-2"
              >
                <BarChart className="h-4 w-4" />
                <span className="hidden md:inline">Analytics</span>
              </Button>
            </Link>
          </div>
        </div>

        <Progress value={completionRate} className="mb-4" />

        <div className="mb-4">
          <h4 className="text-md font-medium mb-1">Motivational Message</h4>
          {editingMessage ? (
            <div className="flex flex-col gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => {
                  setMessage(motivationalMessage);
                  setEditingMessage(false);
                }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveMessage}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <Badge variant="secondary">{message || "No message set"}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingMessage(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
