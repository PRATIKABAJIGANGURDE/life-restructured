
import React from 'react';

interface PremiumFeatureProps {
  title: string;
  description: string;
  isPremium?: boolean; // This prop is no longer used but kept for compatibility
  children?: React.ReactNode;
}

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  children
}) => {
  // Always render the children directly - everything is free now
  return <>{children}</>;
};
