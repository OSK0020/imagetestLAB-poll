'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UserProfile {
  username: string;
  image: string;
  tier: string;
}

export interface UserBalance {
  balance: number;
}

interface UserContextType {
  profile: UserProfile | null;
  balance: UserBalance | null;
  isLoading: boolean;
  refreshUserData: (apiKey: string) => Promise<void>;
  clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUserData = useCallback(async (apiKey: string) => {
    if (!apiKey) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey })
      });

      if (response.ok) {
        const { profile: profileData, balance: balanceData } = await response.json();

        setProfile({
          username: profileData?.githubUsername || profileData?.name || 'Anonymous Builder',
          image: profileData?.image || '',
          tier: profileData?.tier || 'Seed'
        });

        setBalance({
          balance: Number(balanceData?.balance) || 0
        });
      } else {
        setProfile(null);
        setBalance(null);
      }
    } catch (err) {
      console.error("Failed to fetch user dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearUserData = () => {
    setProfile(null);
    setBalance(null);
  };

  return (
    <UserContext.Provider value={{ profile, balance, isLoading, refreshUserData, clearUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserDashboard = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserDashboard must be used within a UserProvider');
  }
  return context;
};
