
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Check, Clock, Home, LogOut, Settings, User, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { generatePersonalPlan } from "@/utils/aiUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Default recovery plan data (fallback)
const defaultPlanData = {
  dailySchedule: [
    { time: "06:30 AM", task: "Wake up & Morning Routine", completed: false },
    { time: "07:00 AM", task: "15 minutes of meditation", completed: false },
    { time: "07:30 AM", task: "Healthy breakfast & vitamins", completed: false },
    { time: "08:00 AM", task: "30 minutes of exercise", completed: false },
    { time: "09:00 AM", task: "Work/Study Session 1", completed: false },
    { time: "12:00 PM", task: "Lunch break & short walk", completed: false },
    { time: "01:00 PM", task: "Work/Study Session 2", completed: false },
    { time: "04:00 PM", task: "Personal development time", completed: false },
    { time: "05:30 PM", task: "Prepare and eat dinner", completed: false },
    { time: "07:00 PM", task: "Leisure activity (not screen-based)", completed: false },
    { time: "09:00 PM", task: "Evening wind-down routine", completed: false },
    { time: "10:00 PM", task: "Bedtime", completed: false },
  ],
  recoverySteps: [
    "Establish a consistent sleep schedule by going to bed and waking up at the same time every day.",
    "Incorporate daily physical activity, even if it's just a 30-minute walk.",
    "Practice mindfulness or meditation for at least 15 minutes each day.",
    "Limit screen time, especially before bed.",
    "Connect with someone socially at least once a day.",
    "Drink adequate water and focus on nutritious meals.",
    "Set aside dedicated time for work/study with regular breaks.",
    "Spend time each day on a hobby or activity you enjoy."
  ],
  motivationalMessage: "Remember, small consistent actions lead to major transformations. You've already taken the hardest step by starting this journey!"
};

const Dashboard = () => {
  const [planData, setPlanData] = useState(defaultPlanData);
  const [schedule, setSchedule] = useState(defaultPlanData.dailySchedule);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Load saved plan on component mount
  useEffect(() => {
    const loadPlan = async () => {
      try {
        // Try to load from localStorage first
        const savedPlan = localStorage.getItem('userPlan');
        if (savedPlan) {
          const parsedPlan = JSON.parse(savedPlan);
          setPlanData(parsedPlan);
          setSchedule(parsedPlan.dailySchedule);
          return;
        }
        
        // If no plan in localStorage and user is logged in, try to generate one
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_data')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (data?.onboarding_data) {
            await regeneratePlan(data.onboarding_data);
          }
        }
      } catch (error) {
        console.error('Error loading plan:', error);
        // Fallback to default plan if loading fails
        setPlanData(defaultPlanData);
        setSchedule(defaultPlanData.dailySchedule);
      }
    };
    
    loadPlan();
  }, [user]);

  const regeneratePlan = async (userInputs = null) => {
    setIsLoading(true);
    
    try {
      // If no inputs provided, fetch from profile
      if (!userInputs && user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_data')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        userInputs = data?.onboarding_data;
      }
      
      if (!userInputs) {
        toast({
          title: "Missing information",
          description: "Please complete the onboarding process first",
          variant: "destructive",
        });
        return;
      }
      
      // Generate new plan
      const result = await generatePersonalPlan(userInputs);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      // Update state with new plan
      setPlanData(result);
      setSchedule(result.dailySchedule);
      
      // Save to localStorage
      localStorage.setItem('userPlan', JSON.stringify(result));
      
      toast({
        title: "Success!",
        description: "Your plan has been updated",
      });
    } catch (error: any) {
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
    
    // Update the planData state
    setPlanData(prev => ({
      ...prev,
      dailySchedule: updatedSchedule
    }));
    
    // Save updated schedule to localStorage
    localStorage.setItem('userPlan', JSON.stringify({
      ...planData,
      dailySchedule: updatedSchedule
    }));
    
    toast({
      title: updatedSchedule[index].completed ? "Task completed!" : "Task marked incomplete",
      description: updatedSchedule[index].task,
    });
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
  const progressPercentage = (completedTasksCount / schedule.length) * 100;

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
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
        
        {/* Main content */}
        <div className="flex-1 py-8 px-4">
          <div className="container max-w-6xl mx-auto">
            {/* Welcome and progress section */}
            <div className="mb-8">
              <h1 className="text-3xl font-medium">Welcome to Your Dashboard</h1>
              <p className="text-muted-foreground mb-6">Track your progress and follow your personalized plan.</p>
              
              <Card className="glass">
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row gap-6 justify-between">
                    <div>
                      <h2 className="text-xl font-medium mb-2">Today's Progress</h2>
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-md h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{completedTasksCount}/{schedule.length}</span>
                      </div>
                    </div>
                    <div className="glass p-4 rounded-xl border border-blue-100">
                      <p className="text-sm italic text-muted-foreground">{planData.motivationalMessage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Regenerate Plan Button */}
            <div className="mb-6 flex justify-end">
              <Button 
                onClick={() => regeneratePlan()} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate Plan
              </Button>
            </div>
            
            {/* Main Tabs */}
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
                  <Check className="h-4 w-4 mr-2" />
                  Progress
                </TabsTrigger>
              </TabsList>
              
              {/* Schedule Tab */}
              <TabsContent value="schedule">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Your Daily Schedule</CardTitle>
                    <CardDescription>
                      Check off tasks as you complete them
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Plan Tab */}
              <TabsContent value="plan">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Your Recovery Plan</CardTitle>
                    <CardDescription>
                      Key steps to restructure your life
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Progress Tab */}
              <TabsContent value="progress">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                    <CardDescription>
                      Track your journey over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">Progress tracking charts will be available in the next update.</p>
                      <Button 
                        onClick={() => regeneratePlan()}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing
                          </>
                        ) : (
                          "Request New Schedule"
                        )}
                      </Button>
                    </div>
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
