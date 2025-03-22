
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-screen w-full">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-medium mb-6 animate-slide-down">About FixYourLife</h1>
            <p className="text-lg text-muted-foreground mb-10 animate-slide-up">
              We created FixYourLife to help people who struggle with productivity, motivation, 
              or daily discipline to find structure and purpose in their lives.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4">
          <div className="container max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-medium mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  At FixYourLife, we believe that everyone deserves a structured, 
                  purposeful life that aligns with their goals and values.
                </p>
                <p className="text-muted-foreground">
                  Our AI-driven platform is designed to provide personalized guidance 
                  that helps you overcome challenges and build sustainable habits.
                </p>
              </div>
              <div className="glass rounded-2xl p-8 shadow-sm">
                <blockquote className="text-lg italic text-muted-foreground">
                  "We don't just want to help you fix your schedule – we want to help you 
                  build a life that feels meaningful and aligned with your true self."
                </blockquote>
                <p className="mt-4 text-right font-medium">- The FixYourLife Team</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Detailed) */}
        <section className="py-16 px-4 bg-white">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium text-center mb-12">How It Works (In Detail)</h2>
            
            <div className="space-y-12">
              {[
                {
                  title: "Life Analysis & Input Collection",
                  description: "Our system collects comprehensive information about your current situation, habits, challenges, and goals. If your input is incomplete, our AI will guide you with specific questions to ensure we have a full picture."
                },
                {
                  title: "AI-Generated Recovery Plan",
                  description: "Using advanced AI, we analyze your input holistically and generate a personalized step-by-step plan. This isn't a generic template – it's built specifically for your unique circumstances and goals."
                },
                {
                  title: "Daily Schedule & To-Do List",
                  description: "Your recovery plan is transformed into a practical daily schedule with specific tasks. This gives you a clear structure to follow each day, eliminating decision fatigue and helping you stay on track."
                },
                {
                  title: "Progress Tracking",
                  description: "As you complete tasks and follow your schedule, you can track your progress directly in the app. This helps you stay accountable and see how far you've come."
                }
              ].map((step, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-sky-50">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-6">Begin Your Journey Today</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Take the first step toward a more structured, purposeful life.
            </p>
            <Button 
              size="lg" 
              className="px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105"
              onClick={() => navigate("/login")}
            >
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default About;
