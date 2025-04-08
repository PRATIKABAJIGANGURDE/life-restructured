
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Download, Upload, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleItem {
  time: string;
  task: string;
  completed: boolean;
  details?: string;
  mealSuggestions?: string[];
}

export const CalendarIntegration = () => {
  const [calendarType, setCalendarType] = useState<string>("google");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const connectToCalendar = () => {
    // In a real implementation, we would use OAuth to connect to the calendar service
    // For demonstration purposes, we'll simulate a successful connection
    
    // Google Calendar auth URL (this would redirect to Google's OAuth flow)
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline&prompt=consent`;
    
    if (calendarType === "google") {
      // In a real app, we would redirect to the OAuth URL
      // window.location.href = googleAuthUrl;
      
      // For this demo, we'll simulate successful connection
      setTimeout(() => {
        setIsConnected(true);
        toast({
          title: "Calendar Connected",
          description: "Successfully connected to Google Calendar.",
        });
      }, 1000);
    } else {
      // For other calendar types
      toast({
        title: "Not Implemented",
        description: `${calendarType} Calendar integration is not yet implemented.`,
        variant: "destructive",
      });
    }
  };
  
  const exportToCalendar = () => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate export process
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          
          toast({
            title: "Export Complete",
            description: "Your schedule has been exported to your calendar.",
          });
          
          return 100;
        }
        return prev + 20;
      });
    }, 500);
    
    // Get schedule data from localStorage
    const userPlan = localStorage.getItem('userPlan');
    if (!userPlan) {
      toast({
        title: "No Schedule Found",
        description: "Please generate a schedule first.",
        variant: "destructive",
      });
      clearInterval(interval);
      setIsExporting(false);
      return;
    }
    
    // In a real implementation, we would use the calendar API to create events
    // Example with Google Calendar API (pseudo-code):
    // const parsedPlan = JSON.parse(userPlan);
    // const dailySchedule = parsedPlan.dailySchedule || [];
    // 
    // dailySchedule.forEach(async (item) => {
    //   await createGoogleCalendarEvent({
    //     summary: item.task,
    //     description: item.details || '',
    //     start: {
    //       dateTime: `${today}T${item.time}:00`,
    //       timeZone: 'America/Los_Angeles',
    //     },
    //     end: {
    //       dateTime: `${today}T${addHoursToTime(item.time, 1)}:00`,
    //       timeZone: 'America/Los_Angeles',
    //     },
    //   });
    // });
  };
  
  const importFromCalendar = () => {
    toast({
      title: "Import Started",
      description: "Importing events from your calendar...",
    });
    
    // Simulate import process
    setTimeout(() => {
      toast({
        title: "Import Complete",
        description: "Calendar events have been imported and merged with your schedule.",
      });
    }, 2000);
    
    // In a real implementation, we would use the calendar API to fetch events
    // Example with Google Calendar API (pseudo-code):
    // const events = await fetchGoogleCalendarEvents({
    //   timeMin: startOfDay.toISOString(),
    //   timeMax: endOfDay.toISOString(),
    //   maxResults: 50,
    //   singleEvents: true,
    //   orderBy: 'startTime',
    // });
    // 
    // Then merge these events with the existing schedule
  };
  
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Calendar Integration</CardTitle>
        <CardDescription>
          Sync your schedule with your preferred calendar service
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendar-type">Calendar Service</Label>
            <Select value={calendarType} onValueChange={setCalendarType}>
              <SelectTrigger id="calendar-type">
                <SelectValue placeholder="Select calendar service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Calendar</SelectItem>
                <SelectItem value="outlook">Outlook Calendar</SelectItem>
                <SelectItem value="apple">Apple Calendar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!isConnected ? (
            <Button 
              onClick={connectToCalendar} 
              className="w-full"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Connect to {calendarType.charAt(0).toUpperCase() + calendarType.slice(1)} Calendar
            </Button>
          ) : (
            <>
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                <div className="flex items-center">
                  <Check className="text-green-500 mr-2 h-5 w-5" />
                  <span>Connected to {calendarType.charAt(0).toUpperCase() + calendarType.slice(1)} Calendar</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsConnected(false)}
                >
                  Disconnect
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button 
                  onClick={exportToCalendar} 
                  variant="outline"
                  disabled={isExporting}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Export Schedule to Calendar
                </Button>
                
                <Button 
                  onClick={importFromCalendar} 
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Import Calendar Events
                </Button>
              </div>
              
              {isExporting && (
                <div className="space-y-2">
                  <Label>Exporting schedule...</Label>
                  <Progress value={exportProgress} className="h-2 w-full" />
                </div>
              )}
            </>
          )}
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-sm">
            <h4 className="font-medium mb-2">About Calendar Integration</h4>
            <p className="text-muted-foreground mb-2">
              Syncing your schedule with your calendar allows you to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>View your daily tasks in your preferred calendar app</li>
              <li>Get notifications for upcoming tasks</li>
              <li>Manage schedule conflicts more effectively</li>
              <li>Keep your recovery plan accessible across all your devices</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
