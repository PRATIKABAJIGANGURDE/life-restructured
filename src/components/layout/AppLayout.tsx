
import React from "react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col antialiased overflow-x-hidden">
      <main className={cn("flex-1 w-full", className)}>
        {children}
      </main>
    </div>
  );
}
