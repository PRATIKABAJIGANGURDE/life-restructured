
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Loader } from "lucide-react";
import { generatePersonalPlan } from "@/utils/aiUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userInputs, setUserInputs] = useState({
    routine: "",
    goals: "",
    challenges: "",
    habits: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Enhanced prompts with more guidance for better responses
  const promptTexts = [
    "Tell us about your current daily routine. What time do you wake up? What activities fill your day? When do you typically go to sleep? Be as detailed as possible to help us create a personalized plan for you.",
    "What are your main goals and aspirations? These could be short-term goals for the next few weeks or longer-term ambitions. What areas of your life do you most want to improve (health, career, relationships, personal growth, etc.)?",
    "What challenges or obstacles are you currently facing? These might be external circumstances, internal struggles, or habits that are holding you back. Understanding your challenges helps us create a plan that addresses your specific needs.",
    "What habits would you like to build or break? Which positive routines do you want to establish in your life? Which negative patterns would you like to overcome? List as many as you'd like to address.",
  ];

  // Enhanced helper prompts to guide user responses
  const helperPrompts = [
    "Example: I wake up around 7:30 AM, often feel rushed in the morning, work from 9-5, have dinner around 7 PM, and usually watch TV until midnight.",
    "Example: I want to improve my fitness, advance in my career, reduce stress, and make time for creative hobbies.",
    "Example: I struggle with procrastination, feel overwhelmed by responsibilities, have trouble maintaining work-life balance, and often lack motivation.",
    "Example: I want to build habits like daily exercise, reading, and meditation. I want to break habits like excessive social media use, poor sleep schedule, and unhealthy snacking.",
  ];

  const handleNextStep = async () => {
    if (inputText.trim().length < 3) {  // Reduced minimum length for testing
      toast({
        title: "Input too short",
        description: "Please provide more details for better results (at least 3 characters)",
        variant: "destructive",
      });
      return;
    }

    // Save the current input based on the step
    const inputKey = Object.keys(userInputs)[step - 1];
    setUserInputs(prev => ({
      ...prev,
      [inputKey]: inputText
    }));

    // For the final step, process and generate a plan
    if (step === promptTexts.length) {
      setIsLoading(true);
      
      try {
        // Save all user inputs to the profile
        if (user) {
          await supabase.from('profiles').update({
            onboarding_data: {
              ...userInputs,
              [inputKey]: inputText
            }
          }).eq('id', user.id);
        }
        
        // Generate personalized plan
        const updatedInputs = {
          ...userInputs,
          [inputKey]: inputText
        };
        
        console.log("Sending inputs to generate plan:", updatedInputs);
        const planResult = await generatePersonalPlan(updatedInputs);
        
        if ('error' in planResult) {
          throw new Error(planResult.error);
        }
        
        console.log("Plan generated successfully:", planResult);
        
        // Save the generated plan to local storage for now
        localStorage.setItem('userPlan', JSON.stringify(planResult));
        
        // Navigate to dashboard
        navigate("/dashboard");
        
        toast({
          title: "Analysis complete!",
          description: "Your personalized plan is ready",
        });
      } catch (error: any) {
        console.error("Error during plan generation:", error);
        toast({
          title: "Error generating plan",
          description: error.message || "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
      
      return;
    }
    
    // Move to next step
    setStep(step + 1);
    setInputText("");
  };

  return (
    <AppLayout className="bg-gradient-to-b from-blue-50 to-white">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-6 px-4 border-b bg-white/80 backdrop-blur-sm">
          <div className="container max-w-5xl mx-auto flex justify-between items-center">
            <Logo />
            <div className="text-sm text-muted-foreground">
              Step {step} of {promptTexts.length}
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl glass shadow-lg animate-fade-in">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Tell us about yourself</CardTitle>
              <CardDescription>
                The more details you provide, the better your plan will be
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{promptTexts[step - 1]}</h3>
                <Textarea 
                  placeholder={helperPrompts[step - 1]} 
                  className="min-h-[200px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {step > 1 ? (
                <Button 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
              ) : (
                <div></div>  
              )}
              <Button 
                onClick={handleNextStep}
                disabled={isLoading || inputText.trim().length < 3} // Reduced minimum length for testing
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : step === promptTexts.length ? (
                  <>
                    Complete
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Onboarding;
