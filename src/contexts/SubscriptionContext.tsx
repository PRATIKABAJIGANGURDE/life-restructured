
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionContextType {
  isLoading: boolean;
  isPremium: boolean;
  checkPremiumStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const { user } = useAuth();

  const checkPremiumStatus = async () => {
    if (!user) {
      setIsPremium(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call your supabase function to check subscription status
      // const { data, error } = await supabase.functions.invoke('check-subscription');
      // if (error) throw error;
      // setIsPremium(data.subscribed);
      
      // For now, we'll use local storage as a simulation
      const hasPremium = localStorage.getItem('premiumUser') === 'true';
      setIsPremium(hasPremium);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPremiumStatus();
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{ isLoading, isPremium, checkPremiumStatus }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
