
import React from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
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
                  <span>Standard support</span>
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
          <StripeCheckout 
            productName="Premium Plan" 
            amount={4999} 
            currency="usd"
            buttonText="Upgrade to Premium"
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default PricingPage;
