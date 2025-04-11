
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  isLoading: boolean;
  isPremium: boolean;
  checkPremiumStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  // All features are now free - always set isPremium to true
  const [isPremium, setIsPremium] = useState(true);
  const { user } = useAuth();

  // This function now always sets isPremium to true, making all features free
  const checkPremiumStatus = async () => {
    setIsLoading(false);
    setIsPremium(true); // Everything is free
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
