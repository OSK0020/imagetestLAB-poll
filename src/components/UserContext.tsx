'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface UserProfile {
  username: string;
  image: string;
  tier: 'Seed' | 'Flower' | 'Nectar' | string;
}

export interface UserBalance {
  totalBalance: number;
  tierBalance: number;
  packBalance: number;
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
      const headers = { 'Authorization': `Bearer ${apiKey}` };

      // Parallel fetching
      const [profileRes, balanceRes] = await Promise.all([
        fetch('https://gen.pollinations.ai/api/account/profile', { headers }),
        fetch('https://gen.pollinations.ai/api/account/balance', { headers })
      ]);

      if (profileRes.ok && balanceRes.ok) {
        const profileData = await profileRes.json();
        const balanceData = await balanceRes.json();

        setProfile({
          username: profileData.username || 'Anonymous Builder',
          image: profileData.image || '',
          tier: profileData.tier || 'Seed'
        });

        setBalance({
          totalBalance: balanceData.totalBalance || 0,
          tierBalance: balanceData.tierBalance || 0,
          packBalance: balanceData.packBalance || 0
        });
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
