import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Check, Clock, Home, LogOut, Settings, User, RefreshCw, Loader, Edit, Save, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { generatePersonalPlan, updateMotivationalMessage } from "@/utils/aiUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Json } from "@/integrations/supabase/types";

interface ScheduleItem {
  time: string;
  task: string;
  completed: boolean;
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

  const handleSaveMessage = async () => {
    if (!user) return;
    
    try {
      setPlanData(prev => ({
        ...prev,
        motivationalMessage
      }));
      
      localStorage.setItem('userPlan', JSON.stringify({
        ...planData,
        motivationalMessage
      }));
      
      if (user) {
        await updateMotivationalMessage(user.id, motivationalMessage);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
  };

  const completedTasksCount = schedule.filter(task => task.completed).length;
  const progressPercentage = schedule.length > 0 ? (completedTasksCount / schedule.length) * 100 : 0;

  const last7DaysProgress = progressHistory.slice(0, 7).reverse();

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
        <header className="py-4 px-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-6xl mx-auto flex justify-between items-center">
            <Logo />
            <nav className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                <User className="h-5 w-5 mr-1" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
                <Settings className="h-5 w-5 mr-1" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </Button>
            </nav>
          </div>
        </header>
        
        <div className="flex-1 py-8 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-medium">Welcome, {userName || "User"}</h1>
              <p className="text-muted-foreground mb-6">Track your progress and follow your personalized plan.</p>
              
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
                        <span className="text-sm font-medium">{completedTasksCount}/{schedule.length}</span>
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
            </div>
            
            <div className="mb-6 flex justify-end">
              <Button 
                onClick={() => regeneratePlan()} 
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
                          onClick={() => regeneratePlan()}
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
                      <div className="space-y-4">
                        {schedule.map((item, index) => (
                          <div 
                            key={index} 
                            className={`flex items-center gap-4 p-3 rounded-lg transition-all ${item.completed ? 'bg-green-50 line-through text-muted-foreground' : 'hover:bg-blue-50'}`}
                          >
                            <Button 
                              variant={item.completed ? "default" : "outline"}
                              size="icon"
                              className={`rounded-full h-8 w-8 ${item.completed ? 'bg-green-500 hover:bg-green-600' : ''}`}
                              onClick={() => toggleTaskCompletion(index)}
                            >
                              {item.completed && <Check className="h-4 w-4" />}
                            </Button>
                            <div className="flex-1">
                              <div className="font-medium">{item.task}</div>
                              <div className="text-sm text-muted-foreground">{item.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="plan">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Your Recovery Plan</CardTitle>
                    <CardDescription>
                      Key steps to restructure your life
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {planData.recoverySteps.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">No recovery steps yet. Generate a new plan to get started.</p>
                        <Button 
                          onClick={() => regeneratePlan()}
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
                      <div className="space-y-4">
                        {planData.recoverySteps.map((step, index) => (
                          <div key={index} className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <p className="pt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="progress">
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
