
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    try {
      setIsLoading(true);
      await resetPassword(email);
      setSubmitted(true);
    } catch (error) {
      // Error is handled in the resetPassword function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout className="bg-gradient-to-b from-blue-50 to-white">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass shadow-lg animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Logo size="md" />
            </div>
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              {submitted 
                ? "Check your email for a reset link" 
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  If an account exists for {email}, you will receive an email with instructions 
                  on how to reset your password.
                </p>
                <Button
                  className="w-full h-12 rounded-md mt-4"
                  onClick={() => navigate("/login")}
                >
                  Back to login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : "Send reset link"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {!submitted && (
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ForgotPassword;
