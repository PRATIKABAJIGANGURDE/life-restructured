
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Home, Loader, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { generatePersonalPlan } from "@/utils/aiUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

// Import refactored components
import { DailyProgress } from "@/components/dashboard/DailyProgress";
import { TaskList } from "@/components/dashboard/TaskList";
import { RecoveryPlan } from "@/components/dashboard/RecoveryPlan";
import { ProgressHistory } from "@/components/dashboard/ProgressHistory";
import { ActionButtons } from "@/components/dashboard/ActionButtons";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

interface ScheduleItem {
  time: string;
  task: string;
  completed: boolean;
  details?: string;
  mealSuggestions?: string[];
}

interface ProgressHistoryItem {
  date: string;
  completionRate: number;
  tasksCompleted: number;
  totalTasks: number;
}

interface PlanData {
  dailySchedule: ScheduleItem[];
  recoverySteps: string[];
  motivationalMessage: string;
}

const Dashboard = () => {
  const [planData, setPlanData] = useState<PlanData>({
    dailySchedule: [],
    recoverySteps: [],
    motivationalMessage: ""
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [progressHistory, setProgressHistory] = useState<ProgressHistoryItem[]>([]);
  const [expandedTaskIndex, setExpandedTaskIndex] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('onboarding_data, full_name')
            .eq('id', user.id)
            .single();
            
          if (profileError) throw profileError;
          
          if (profileData && profileData.full_name) {
            setUserName(profileData.full_name);
          } else if (user.email) {
            setUserName(user.email.split('@')[0]);
          }
          
          const lastResetDate = localStorage.getItem('lastResetDate');
          const today = new Date().toLocaleDateString();
          
          if (lastResetDate !== today) {
            console.log('New day detected, resetting tasks');
            localStorage.setItem('lastResetDate', today);
            
            const savedPlan = localStorage.getItem('userPlan');
            if (savedPlan) {
              const parsedPlan = JSON.parse(savedPlan);
              if (parsedPlan.dailySchedule && parsedPlan.dailySchedule.length > 0) {
                const resetSchedule = parsedPlan.dailySchedule.map((item: ScheduleItem) => ({
                  ...item,
                  completed: false
                }));
                
                const updatedPlan = {
                  ...parsedPlan,
                  dailySchedule: resetSchedule
                };
                
                localStorage.setItem('userPlan', JSON.stringify(updatedPlan));
                setPlanData(updatedPlan);
                setSchedule(resetSchedule);
                
                toast({
                  title: "Daily tasks reset",
                  description: "Tasks have been automatically reset for a new day",
                });
              }
            }
          }
          
          const savedPlan = localStorage.getItem('userPlan');
          if (savedPlan) {
            const parsedPlan = JSON.parse(savedPlan);
            setPlanData(parsedPlan);
            setSchedule(parsedPlan.dailySchedule || []);
            
            if (parsedPlan.motivationalMessage) {
              setMotivationalMessage(parsedPlan.motivationalMessage);
            } else if (profileData && 
                      profileData.onboarding_data && 
                      typeof profileData.onboarding_data === 'object' &&
                      !Array.isArray(profileData.onboarding_data) &&
                      profileData.onboarding_data.motivationalMessage) {
              const onboardingData = profileData.onboarding_data as Record<string, Json>;
              if (onboardingData.motivationalMessage) {
                setMotivationalMessage(String(onboardingData.motivationalMessage));
              }
            }
            
            const progressData = localStorage.getItem('progressHistory');
            if (progressData) {
              setProgressHistory(JSON.parse(progressData));
            }
            
            setIsLoading(false);
            return;
          }
          
          if (profileData && profileData.onboarding_data) {
            const onboardingData = profileData.onboarding_data;
            if (typeof onboardingData === 'object' && onboardingData !== null && !Array.isArray(onboardingData)) {
              const typedOnboardingData = onboardingData as Record<string, Json>;
              if (typedOnboardingData.motivationalMessage) {
                setMotivationalMessage(String(typedOnboardingData.motivationalMessage));
              }
              await regeneratePlan(profileData.onboarding_data);
            } else {
              console.log("No onboarding data found for user, navigating to onboarding");
              navigate("/onboarding");
            }
          } else {
            console.log("No onboarding data found for user, navigating to onboarding");
            navigate("/onboarding");
          }
        }
      } catch (error) {
        console.error('Error loading plan:', error);
        setIsLoading(false);
        toast({
          title: "Error loading plan",
          description: "There was an error loading your plan. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    loadPlan();
    
    const checkMidnightReset = () => {
      const now = new Date();
      const lastResetDate = localStorage.getItem('lastResetDate');
      const today = now.toLocaleDateString();
      
      if (lastResetDate !== today) {
        console.log('Midnight passed, resetting tasks');
        localStorage.setItem('lastResetDate', today);
        
        const savedPlan = localStorage.getItem('userPlan');
        if (savedPlan) {
          const parsedPlan = JSON.parse(savedPlan);
          if (parsedPlan.dailySchedule && parsedPlan.dailySchedule.length > 0) {
            const resetSchedule = parsedPlan.dailySchedule.map((item: ScheduleItem) => ({
              ...item,
              completed: false
            }));
            
            const updatedPlan = {
              ...parsedPlan,
              dailySchedule: resetSchedule
            };
            
            localStorage.setItem('userPlan', JSON.stringify(updatedPlan));
            setPlanData(updatedPlan);
            setSchedule(resetSchedule);
            
            toast({
              title: "Daily tasks reset",
              description: "Tasks have been automatically reset for a new day",
            });
          }
        }
      }
    };
    
    const intervalId = setInterval(checkMidnightReset, 60000);
    
    if (!localStorage.getItem('lastResetDate')) {
      localStorage.setItem('lastResetDate', new Date().toLocaleDateString());
    }
    
    return () => {
      clearInterval(intervalId);
    };
  }, [user, navigate, toast]);

  useEffect(() => {
    if (planData && planData.motivationalMessage) {
      setMotivationalMessage(planData.motivationalMessage);
    }
  }, [planData]);

  const regeneratePlan = async (userInputs = null) => {
    setIsLoading(true);
    
    try {
      if (!userInputs && user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_data')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        userInputs = data && data.onboarding_data;
      }
      
      if (!userInputs) {
        toast({
          title: "Missing information",
          description: "Please complete the onboarding process first",
          variant: "destructive",
        });
        navigate("/onboarding");
        return;
      }
      
      console.log("Generating plan with inputs:", userInputs);
      
      const result = await generatePersonalPlan(userInputs);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      console.log("Plan generated successfully:", result);
      
      setPlanData(result);
      setSchedule(result.dailySchedule);
      
      localStorage.setItem('userPlan', JSON.stringify(result));
      
      toast({
        title: "Success!",
        description: "Your personal plan has been generated",
      });
    } catch (error) {
      console.error('Error regenerating plan:', error);
      toast({
        title: "Failed to generate plan",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = (index: number) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index].completed = !updatedSchedule[index].completed;
    setSchedule(updatedSchedule);
    
    setPlanData(prev => ({
      ...prev,
      dailySchedule: updatedSchedule
    }));
    
    localStorage.setItem('userPlan', JSON.stringify({
      ...planData,
      dailySchedule: updatedSchedule
    }));
    
    const today = new Date().toISOString().split('T')[0];
    const completedCount = updatedSchedule.filter(task => task.completed).length;
    const totalTasks = updatedSchedule.length || 1;
    const completionRate = (completedCount / totalTasks) * 100;
    
    const updatedHistory = [...progressHistory];
    const existingEntryIndex = updatedHistory.findIndex(entry => entry.date === today);
    
    if (existingEntryIndex >= 0) {
      updatedHistory[existingEntryIndex].completionRate = completionRate;
    } else {
      updatedHistory.push({
        date: today,
        completionRate: completionRate,
        tasksCompleted: completedCount,
        totalTasks: totalTasks
      });
    }
    
    updatedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const limitedHistory = updatedHistory.slice(0, 30);
    setProgressHistory(limitedHistory);
    
    localStorage.setItem('progressHistory', JSON.stringify(limitedHistory));
    
    toast({
      title: updatedSchedule[index].completed ? "Task completed!" : "Task marked incomplete",
      description: updatedSchedule[index].task,
    });
  };

  const resetDailyTasks = () => {
    if (!schedule.length) return;
    
    const resetSchedule = schedule.map(item => ({
      ...item,
      completed: false
    }));
    
    setSchedule(resetSchedule);
    
    setPlanData(prev => ({
      ...prev,
      dailySchedule: resetSchedule
    }));
    
    localStorage.setItem('userPlan', JSON.stringify({
      ...planData,
      dailySchedule: resetSchedule
    }));
    
    toast({
      title: "Daily tasks reset",
      description: "All tasks have been marked as incomplete",
    });
  };

  const toggleTaskExpansion = (index: number) => {
    setExpandedTaskIndex(prev => prev === index ? null : index);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
  };

  const completedTasksCount = schedule.filter(task => task.completed).length;

  if (isLoading && schedule.length === 0) {
    return (
      <AppLayout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-medium mb-2">Generating Your Plan</h2>
            <p className="text-muted-foreground">Please wait while we create your personalized plan...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col">
        <DashboardHeader handleLogout={handleLogout} />
        
        <div className="flex-1 py-8 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-medium">Welcome, {userName || "User"}</h1>
              <p className="text-muted-foreground mb-6">Track your progress and follow your personalized plan.</p>
              
              <DailyProgress 
                completedTasksCount={completedTasksCount}
                totalTasks={schedule.length}
                motivationalMessage={motivationalMessage}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                setMotivationalMessage={setMotivationalMessage}
                planData={planData}
                userId={user?.id}
              />
            </div>
            
            <ActionButtons 
              isLoading={isLoading}
              hasSchedule={schedule.length > 0}
              resetDailyTasks={resetDailyTasks}
              regeneratePlan={regeneratePlan}
            />
            
            <Tabs defaultValue="schedule" className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="schedule">
                  <Clock className="h-4 w-4 mr-2" />
                  Daily Schedule
                </TabsTrigger>
                <TabsTrigger value="plan">
                  <Home className="h-4 w-4 mr-2" />
                  Recovery Plan
                </TabsTrigger>
                <TabsTrigger value="progress">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Progress
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="schedule">
                <TaskList 
                  schedule={schedule}
                  isLoading={isLoading}
                  expandedTaskIndex={expandedTaskIndex}
                  toggleTaskExpansion={toggleTaskExpansion}
                  toggleTaskCompletion={toggleTaskCompletion}
                  regeneratePlan={regeneratePlan}
                />
              </TabsContent>
              
              <TabsContent value="plan">
                <RecoveryPlan 
                  recoverySteps={planData.recoverySteps}
                  isLoading={isLoading}
                  regeneratePlan={regeneratePlan}
                />
              </TabsContent>
              
              <TabsContent value="progress">
                <ProgressHistory progressHistory={progressHistory} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
