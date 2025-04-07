
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col antialiased overflow-x-hidden">
      <main className={cn(
        "flex-1 w-full",
        isMobile ? "px-0" : "px-4",
        className
      )}>
        {children}
      </main>
    </div>
  );
}
