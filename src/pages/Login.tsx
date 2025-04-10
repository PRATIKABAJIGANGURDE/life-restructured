
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      // No need to navigate or show success toast as the AuthContext will handle it
    } catch (error) {
      // Error is already handled in the signIn function
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
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button 
                    variant="link" 
                    className="px-0 text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/forgot-password");
                    }}
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    Signing in...
                  </>
                ) : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button 
                variant="link" 
                className="px-1"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Login;
