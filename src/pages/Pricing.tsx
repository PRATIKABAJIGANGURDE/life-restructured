
import React from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Calendar, FileBarChart, Shield, Star, Lock } from "lucide-react";
import { StripeCheckout } from '@/components/payment/StripeCheckout';

const PricingPage = () => {
  return (
    <AppLayout>
      <div className="container px-4 py-12 mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Choose the plan that's right for your journey to fixing your life
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2 border-muted">
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <div className="text-4xl font-bold">$0</div>
              <CardDescription>Essential features to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Basic recovery plan</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Daily progress tracking</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Basic reports</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Calendar integration</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan with Stripe Checkout */}
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Premium Plan</CardTitle>
                <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full flex items-center">
                  <Star className="h-3 w-3 mr-1" /> RECOMMENDED
                </span>
              </div>
              <div className="text-4xl font-bold">$49.99</div>
              <CardDescription>Advanced features for serious progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Everything in Free plan</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span className="font-medium">Calendar integration</span>
                  <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded">New</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span className="font-medium">Advanced analytics & reports</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Ad-free experience</span>
                </li>
              </ul>

              <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/10">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Calendar Integration</h4>
                    <p className="text-xs text-muted-foreground">Sync your recovery plan with Google, Apple, or Outlook calendar for better adherence and scheduling.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="default" className="w-full" onClick={() => window.location.href = "/pricing"}>
                Upgrade to Premium
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default PricingPage;
