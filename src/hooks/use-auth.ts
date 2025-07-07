
'use client';

import { createContext, useContext } from 'react';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';

export type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
