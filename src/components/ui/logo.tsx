
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className={cn("font-medium tracking-tight flex items-center", sizeClasses[size], className)}>
      <span className="text-primary">Fix</span>
      <span>Your</span>
      <span className="text-primary">Life</span>
    </div>
  );
}
