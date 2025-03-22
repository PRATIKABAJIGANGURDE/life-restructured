
import React from "react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col antialiased">
      <main className={cn("flex-1", className)}>
        {children}
      </main>
    </div>
  );
}
