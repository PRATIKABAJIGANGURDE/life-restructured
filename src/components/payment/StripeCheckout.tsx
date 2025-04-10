
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface StripeCheckoutProps {
  productName?: string;
  amount?: number;
  currency?: string;
  buttonText?: string;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  productName = "Premium Access",
  amount = 4999, // $49.99 in cents
  currency = "usd",
  buttonText = "Upgrade Now"
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue with payment",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          productName,
          amount,
          currency
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (error: any) {
      console.error("Error initiating checkout:", error);
      toast({
        title: "Checkout failed",
        description: error.message || "An error occurred during checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{productName}</CardTitle>
        <CardDescription>
          Get premium features and support
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          ${(amount / 100).toFixed(2)} <span className="text-sm font-normal text-muted-foreground uppercase">{currency}</span>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center">
            <span className="mr-2">✓</span> Personalized recovery plans
          </li>
          <li className="flex items-center">
            <span className="mr-2">✓</span> Advanced analytics
          </li>
          <li className="flex items-center">
            <span className="mr-2">✓</span> Priority support
          </li>
          <li className="flex items-center">
            <span className="mr-2">✓</span> Ad-free experience
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCheckout} 
          disabled={loading || !user} 
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
