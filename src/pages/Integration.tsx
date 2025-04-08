
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PeriodicReports } from "@/components/reports/PeriodicReports";
import { CalendarIntegration } from "@/components/calendar/CalendarIntegration";

const Integration = () => {
  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 py-4 md:py-8 px-3 md:px-4">
          <div className="container max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Integrations & Reports</h1>
            <p className="text-muted-foreground text-sm md:text-base mb-6">
              Manage your reports and external service integrations
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div>
                <PeriodicReports />
              </div>
              <div>
                <CalendarIntegration />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Integration;
