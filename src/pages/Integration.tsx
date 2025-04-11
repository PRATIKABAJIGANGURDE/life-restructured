
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PeriodicReports } from "@/components/reports/PeriodicReports";
import { CalendarIntegration } from "@/components/calendar/CalendarIntegration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Integration = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 py-4 md:py-8 px-3 md:px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl md:text-3xl font-medium">
                Integrations & Reports
              </h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base mb-6">
              Track your progress and sync your schedule with external services
            </p>
            
            <div className="hidden lg:block">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <PeriodicReports />
                </div>
                <div>
                  <CalendarIntegration />
                </div>
              </div>
            </div>
            
            <div className="lg:hidden">
              <Tabs defaultValue="reports" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="reports" className="flex items-center justify-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Reports
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center justify-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="reports">
                  <PeriodicReports />
                </TabsContent>
                <TabsContent value="calendar">
                  <CalendarIntegration />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium mb-2">Integration Benefits</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Enhance your recovery journey by connecting with external services and analyzing your progress
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Calendar Integration</h3>
                    <p className="text-sm text-muted-foreground">Keep track of your schedule across all your devices and get timely reminders.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Progress Reports</h3>
                    <p className="text-sm text-muted-foreground">Monitor your recovery journey with detailed analytics and improvement suggestions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Integration;
