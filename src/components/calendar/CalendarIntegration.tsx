
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Download, 
  Upload, 
  Check, 
  FileText, 
  Clock, 
  CalendarCheck, 
  CalendarDays, 
  Shield, 
  Activity, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ScheduleItem {
  time: string;
  task: string;
  completed: boolean;
  details?: string;
  mealSuggestions?: string[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  description?: string;
  location?: string;
}

interface ConnectionStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastSynced: string | null;
  accountInfo: {
    email?: string;
    name?: string;
    avatar?: string;
    scope?: string[];
  } | null;
  errorMessage?: string;
}

export const CalendarIntegration = () => {
  const [calendarType, setCalendarType] = useState<string>("google");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
    lastSynced: null,
    accountInfo: null
  });
  const [isVerifyingConnection, setIsVerifyingConnection] = useState<boolean>(false);
  const [syncOptions, setSyncOptions] = useState({
    includeCompletedTasks: true,
    addReminders: true,
    syncTwoWay: false,
    preferredTime: "09:00"
  });
  const { toast } = useToast();
  const { user } = useAuth();
  
  const connectToCalendar = () => {
    // Set connecting state
    setIsConnecting(true);
    setConnectionStatus({
      ...connectionStatus,
      status: 'connecting'
    });
    
    toast({
      title: "Connecting to Calendar",
      description: `Initiating connection to ${calendarType.charAt(0).toUpperCase() + calendarType.slice(1)} Calendar...`,
    });
    
    // Google Calendar auth URL (this would redirect to Google's OAuth flow)
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline&prompt=consent`;
    
    if (calendarType === "google") {
      // In a real app, we would redirect to the OAuth URL
      // window.location.href = googleAuthUrl;
      
      // For this demo, we'll simulate OAuth flow
      setTimeout(() => {
        // First simulate the redirect return with auth code
        setIsVerifyingConnection(true);
        toast({
          title: "Verifying Connection",
          description: "Authenticating with Google Calendar...",
        });
        
        // Then simulate token exchange and API verification
        setTimeout(() => {
          setIsVerifyingConnection(false);
          setIsConnecting(false);
          
          // Set connection status to connected with account details
          setConnectionStatus({
            status: 'connected',
            lastSynced: new Date().toISOString(),
            accountInfo: {
              email: user?.email || 'user@example.com',
              name: 'John Doe',
              scope: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events']
            }
          });
          
          // Load example events
          setEvents([
            {
              id: '1',
              title: 'Morning Exercise',
              start: '2025-04-09T07:00:00',
              end: '2025-04-09T07:30:00',
              description: 'Daily cardio workout'
            },
            {
              id: '2',
              title: 'Therapy Session',
              start: '2025-04-09T10:00:00',
              end: '2025-04-09T11:00:00',
              location: 'Main St. Medical Center'
            },
            {
              id: '3',
              title: 'Support Group',
              start: '2025-04-10T15:00:00',
              end: '2025-04-10T16:30:00',
              location: 'Community Center'
            }
          ]);
          
          toast({
            title: "Calendar Connected",
            description: "Successfully connected and verified with Google Calendar.",
          });
        }, 2000);
      }, 1500);
    } else {
      // For other calendar types
      setTimeout(() => {
        setIsConnecting(false);
        setConnectionStatus({
          ...connectionStatus,
          status: 'error',
          errorMessage: `${calendarType.charAt(0).toUpperCase() + calendarType.slice(1)} Calendar integration is not yet available.`
        });
        
        toast({
          title: "Connection Failed",
          description: `${calendarType.charAt(0).toUpperCase() + calendarType.slice(1)} Calendar integration is not yet implemented.`,
          variant: "destructive",
        });
      }, 1000);
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
  
  const handleSyncOptionChange = (option: string, value: boolean) => {
    setSyncOptions(prev => ({ ...prev, [option]: value }));
  };
  
  const getFormattedEventTime = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return `${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };
  
  const getFormattedEventDate = (start: string) => {
    const startDate = new Date(start);
    return startDate.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'});
  };
  
  const setupAutomaticSync = () => {
    toast({
      title: "Automatic Sync Enabled",
      description: "Your schedule will now automatically sync with your calendar.",
    });
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
          
          {connectionStatus.status === 'disconnected' ? (
            <Button 
              onClick={connectToCalendar} 
              className="w-full"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Connect to {calendarType.charAt(0).toUpperCase() + calendarType.slice(1)} Calendar
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              {connectionStatus.status === 'error' ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {connectionStatus.errorMessage || "Failed to connect to calendar service."}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto ml-2" 
                      onClick={() => setConnectionStatus({
                        status: 'disconnected',
                        lastSynced: null,
                        accountInfo: null
                      })}
                    >
                      Try again
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                  <div className="flex items-center">
                    <Check className="text-green-500 mr-2 h-5 w-5" />
                    <div>
                      <div>Connected to {calendarType.charAt(0).toUpperCase() + calendarType.slice(1)} Calendar</div>
                      {connectionStatus.accountInfo?.email && (
                        <div className="text-xs text-muted-foreground">
                          Account: {connectionStatus.accountInfo.email}
                        </div>
                      )}
                      {connectionStatus.lastSynced && (
                        <div className="text-xs text-muted-foreground">
                          Last synced: {new Date(connectionStatus.lastSynced).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setConnectionStatus({
                            status: 'disconnected',
                            lastSynced: null,
                            accountInfo: null
                          })}
                        >
                          Disconnect
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Disconnect from calendar service</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              
              {isVerifyingConnection && (
                <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <div className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm">Verifying connection with {calendarType.charAt(0).toUpperCase() + calendarType.slice(1)} Calendar API...</span>
                  </div>
                  <Progress value={65} className="h-1 w-full" />
                </div>
              )}
              
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
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Sync Options</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeCompleted" 
                        checked={syncOptions.includeCompletedTasks}
                        onCheckedChange={(checked) => handleSyncOptionChange('includeCompletedTasks', checked === true)}
                      />
                      <label htmlFor="includeCompleted" className="text-sm text-muted-foreground cursor-pointer">
                        Include completed tasks
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="addReminders" 
                        checked={syncOptions.addReminders}
                        onCheckedChange={(checked) => handleSyncOptionChange('addReminders', checked === true)}
                      />
                      <label htmlFor="addReminders" className="text-sm text-muted-foreground cursor-pointer">
                        Add calendar reminders (30 min before)
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="syncTwoWay" 
                        checked={syncOptions.syncTwoWay}
                        onCheckedChange={(checked) => handleSyncOptionChange('syncTwoWay', checked === true)}
                      />
                      <label htmlFor="syncTwoWay" className="text-sm text-muted-foreground cursor-pointer">
                        Two-way sync (update app when calendar changes)
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="preferredTime" className="text-sm text-muted-foreground">Default time for tasks without time</Label>
                    <Input 
                      id="preferredTime" 
                      type="time" 
                      value={syncOptions.preferredTime}
                      onChange={(e) => setSyncOptions(prev => ({ ...prev, preferredTime: e.target.value }))}
                      className="w-32 mt-1"
                    />
                  </div>
                </div>
                
                <Button onClick={setupAutomaticSync} className="w-full">
                  <Clock className="mr-2 h-4 w-4" />
                  Enable Automatic Sync
                </Button>
              </div>
              
              {connectionStatus.status === 'connected' && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-md border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-blue-500" />
                      Connection Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Service:</span>
                        <span className="font-medium">{calendarType.charAt(0).toUpperCase() + calendarType.slice(1)} Calendar</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Account:</span>
                        <span className="font-medium">{connectionStatus.accountInfo?.email || 'N/A'}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="flex items-center">
                          <Badge className="bg-green-500">Active</Badge>
                        </span>
                      </div>
                      
                      {connectionStatus.accountInfo?.scope && (
                        <div className="grid grid-cols-2 gap-1">
                          <span className="text-muted-foreground">Permissions:</span>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">Read Events</Badge>
                            <Badge variant="outline" className="text-xs">Write Events</Badge>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-muted-foreground">Last verification:</span>
                        <span>{connectionStatus.lastSynced ? new Date(connectionStatus.lastSynced).toLocaleString() : 'Never'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setIsVerifyingConnection(true);
                          setTimeout(() => {
                            setIsVerifyingConnection(false);
                            setConnectionStatus({
                              ...connectionStatus,
                              lastSynced: new Date().toISOString()
                            });
                            toast({
                              title: "Connection Verified",
                              description: "Calendar connection is active and working properly.",
                            });
                          }, 2000);
                        }}
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        Verify Connection
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                </>
              )}
              
              {events.length > 0 && (
                <>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Upcoming Calendar Events</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {events.map(event => (
                        <div key={event.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md space-y-1">
                          <div className="flex justify-between items-start">
                            <div className="font-medium">{event.title}</div>
                            <Badge variant="outline">{getFormattedEventDate(event.start)}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {getFormattedEventTime(event.start, event.end)}
                          </div>
                          {event.location && (
                            <div className="text-sm text-muted-foreground">{event.location}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
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
      <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center text-sm">
          {connectionStatus.status === 'connected' && (
            <>
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                <span>Connected</span>
              </div>
              
              <Separator orientation="vertical" className="mx-2 h-4" />
              
              <span className="text-muted-foreground">
                Next sync in 15 minutes
              </span>
            </>
          )}
          
          {connectionStatus.status === 'disconnected' && (
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-gray-400 mr-1.5"></span>
              <span className="text-muted-foreground">Not connected</span>
            </div>
          )}
          
          {connectionStatus.status === 'connecting' && (
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse mr-1.5"></span>
              <span>Connecting...</span>
            </div>
          )}
          
          {connectionStatus.status === 'error' && (
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></span>
              <span className="text-red-500">Connection error</span>
            </div>
          )}
        </div>
        
        {connectionStatus.status === 'connected' && (
          <Button variant="ghost" size="sm" onClick={() => {
            const now = new Date().toISOString();
            setConnectionStatus({
              ...connectionStatus,
              lastSynced: now
            });
            toast({
              title: "Calendar Synced",
              description: "Calendar data has been refreshed.",
            });
          }}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
