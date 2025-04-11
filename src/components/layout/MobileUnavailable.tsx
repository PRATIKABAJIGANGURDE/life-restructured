
import React from "react";
import { Logo } from "@/components/ui/logo";
import { Laptop, Tablet } from "lucide-react";

export const MobileUnavailable: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <Logo size="md" className="mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Mobile Version Unavailable
        </h1>
        
        <div className="bg-blue-50 rounded-md p-4 mb-6">
          <p className="text-gray-700 mb-4">
            We're sorry, FixYourLife is currently unavailable on mobile devices.
          </p>
          <p className="text-gray-700 font-medium">
            Please switch to a desktop or tablet for the best experience.
          </p>
        </div>
        
        <div className="flex justify-center space-x-4 text-primary">
          <div className="flex flex-col items-center">
            <Laptop className="h-8 w-8 mb-2" />
            <span className="text-sm">Desktop</span>
          </div>
          <div className="flex flex-col items-center">
            <Tablet className="h-8 w-8 mb-2" />
            <span className="text-sm">Tablet</span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mt-8">
        &copy; {new Date().getFullYear()} FixYourLife. All rights reserved.
      </p>
    </div>
  );
};
