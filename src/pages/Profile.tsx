
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Save, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    avatarUrl: ""
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get user profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setUserData({
          fullName: data?.full_name || "",
          email: user.email || "",
          avatarUrl: data?.avatar_url || ""
        });
      } catch (error: any) {
        console.error('Error loading user data:', error);
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [user, toast]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setIsEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
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
            <h1 className="text-3xl font-medium mb-6">Profile</h1>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userData.avatarUrl} alt={userData.fullName} />
                    <AvatarFallback className="text-xl">{getInitials(userData.fullName)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <label htmlFor="fullName" className="text-sm font-medium">
                            Full Name
                          </label>
                          <Input
                            id="fullName"
                            value={userData.fullName}
                            onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                            placeholder="Enter your full name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Email
                          </label>
                          <Input
                            id="email"
                            value={userData.email}
                            disabled
                            className="bg-gray-50"
                          />
                          <p className="text-xs text-muted-foreground">
                            Email cannot be changed
                          </p>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => setIsEditing(false)}
                            variant="outline"
                            disabled={isLoading}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>Saving...</>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-1" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-lg font-medium">{userData.fullName || "Not set"}</h3>
                          <p className="text-muted-foreground">{userData.email}</p>
                        </div>
                        
                        <Button 
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Profile
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between mb-3">
              <h2 className="text-xl font-medium">Account Settings</h2>
              <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
                Manage Settings
              </Button>
            </div>
            
            <Card>
              <CardContent className="py-6">
                <p className="text-muted-foreground">
                  Visit the settings page to manage your account preferences, recovery plan, and notification settings.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
