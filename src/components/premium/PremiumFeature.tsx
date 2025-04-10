
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Star, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumFeatureProps {
  title: string;
  description: string;
  isPremium?: boolean; // Whether the user has premium access
  children?: React.ReactNode; // The premium content to conditionally render
}

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  title,
  description,
  isPremium = false,
  children
}) => {
  const navigate = useNavigate();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Premium Feature
          </h3>
          <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
            <Star className="h-3 w-3 inline mr-1" />
            Premium Only
          </span>
        </div>
      </div>
      <CardContent className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button 
          className="flex items-center justify-center" 
          onClick={() => navigate('/pricing')}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Upgrade to Premium
        </Button>
      </CardContent>
    </Card>
  );
};
