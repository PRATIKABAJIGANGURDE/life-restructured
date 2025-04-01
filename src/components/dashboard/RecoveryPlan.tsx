
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface RecoveryPlanProps {
  recoverySteps: string[];
  isLoading: boolean;
  regeneratePlan: () => void;
}

export const RecoveryPlan: React.FC<RecoveryPlanProps> = ({
  recoverySteps,
  isLoading,
  regeneratePlan,
}) => {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Your Recovery Plan</CardTitle>
        <CardDescription>
          Key steps to restructure your life
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recoverySteps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No recovery steps yet. Generate a new plan to get started.</p>
            <Button 
              onClick={regeneratePlan}
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
            {recoverySteps.map((step, index) => (
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
  );
};
