
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="relative w-full overflow-hidden">
        {/* Hero Section */}
        <section className="min-h-screen w-full flex flex-col items-center justify-center py-20 px-4 relative">
          {/* Background styling */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10"></div>
          <div className="absolute top-1/4 -right-64 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
          <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
          
          {/* Hero content */}
          <div className="container max-w-5xl mx-auto flex flex-col items-center text-center animate-fade-in">
            <Logo size="lg" className="mb-8 animate-float" />
            
            <h1 className="text-4xl md:text-6xl font-medium text-balance max-w-3xl mb-6 animate-slide-down">
              Reset Your <span className="text-primary">Life</span> With AI-Driven Guidance
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-slide-up delay-100">
              FixYourLife helps you restructure your daily routine with personalized recovery plans, converting chaos into clarity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-200">
              <Button 
                size="lg" 
                className="px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105"
                onClick={() => navigate("/login")}
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 rounded-full text-lg border-2 hover:bg-blue-50"
                onClick={() => navigate("/about")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 bg-white">
          <div className="container max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-medium text-center mb-16">How FixYourLife Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Share Your Situation",
                  description: "Tell us about your current life situation, routines, and goals.",
                  number: "01"
                },
                {
                  title: "Get Your Plan",
                  description: "Receive a personalized recovery plan powered by AI analysis.",
                  number: "02"
                },
                {
                  title: "Track Progress",
                  description: "Follow your daily schedule and check off completed tasks.",
                  number: "03"
                }
              ].map((feature, index) => (
                <div key={index} className="relative glass rounded-2xl p-8 shadow-sm hover:shadow-md group">
                  <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-medium">
                    {feature.number}
                  </div>
                  <h3 className="text-xl font-medium mb-3 group-hover:text-primary">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 bg-gradient-to-r from-blue-50 to-sky-50">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-6">Ready to Fix Your Life?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of users who have transformed their daily routines and achieved their goals.
            </p>
            <Button 
              size="lg" 
              className="px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105"
              onClick={() => navigate("/login")}
            >
              Start Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;
