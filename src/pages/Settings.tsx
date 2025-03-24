
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Shield, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    planReminders: true,
    motivationalMessage: ""
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get user profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_data')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data?.onboarding_data) {
          const onboardingData = data.onboarding_data;
          if (typeof onboardingData === 'object' && onboardingData !== null && !Array.isArray(onboardingData)) {
            // Fixed: only use spread operator on object type after type checking
            const motivationalMessage = onboardingData.motivationalMessage as string || "";
            setSettings({
              emailNotifications: true,
              planReminders: true,
              motivationalMessage: motivationalMessage
            });
          }
        }
      } catch (error: any) {
        console.error('Error loading settings:', error);
        toast({
          title: "Error loading settings",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user, toast]);

  const handleSaveSettings = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get current onboarding data
      const { data: currentData, error: fetchError } = await supabase
        .from('profiles')
        .select('onboarding_data')
        .eq('id', user.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update onboarding data with new settings
      const updatedOnboardingData = {
        ...currentData?.onboarding_data,
        motivationalMessage: settings.motivationalMessage
      };
      
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_data: updatedOnboardingData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local storage
      const savedPlan = localStorage.getItem('userPlan');
      if (savedPlan) {
        const parsedPlan = JSON.parse(savedPlan);
        parsedPlan.motivationalMessage = settings.motivationalMessage;
        localStorage.setItem('userPlan', JSON.stringify(parsedPlan));
      }
      
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col">
        <header className="py-4 px-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-6xl mx-auto flex justify-between items-center">
            <Logo />
            <nav className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Dashboard
              </Button>
            </nav>
          </div>
        </header>
        
        <div className="flex-1 py-8 px-4">
          <div className="container max-w-3xl mx-auto">
            <h1 className="text-3xl font-medium mb-6">Settings</h1>
            
            <Tabs defaultValue="general" className="w-full mb-8">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Motivational Message</CardTitle>
                    <CardDescription>Customize your personal motivational message that appears on your dashboard</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={settings.motivationalMessage}
                      onChange={(e) => setSettings({...settings, motivationalMessage: e.target.value})}
                      placeholder="Enter a motivational message that inspires you"
                      className="min-h-[100px]"
                    />
                    <div className="mt-4">
                      <Button 
                        onClick={handleSaveSettings}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Save Message
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>Manage your account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Log Out</h3>
                        <p className="text-sm text-muted-foreground">Sign out of your account</p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Log Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch 
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Plan Reminders</h3>
                        <p className="text-sm text-muted-foreground">Get reminders about your daily schedule</p>
                      </div>
                      <Switch 
                        checked={settings.planReminders}
                        onCheckedChange={(checked) => setSettings({...settings, planReminders: checked})}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        Note: Email notifications will be available in a future update.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="privacy" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Manage your privacy preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      We take your privacy seriously. Your data is encrypted and securely stored.
                    </p>
                    <p className="text-sm">
                      For more information, please refer to our privacy policy.
                    </p>
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

export default Settings;
