
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { AuthContext, type AuthContextType } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const ADMIN_UID = 'ADMIN_USER_ID'; // A UID fictícia para o admin implícito

function FullscreenLoader() {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6">
          <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
              </div>
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-28" />
          </div>
      </div>
    </div>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserProfile = useCallback(async (firebaseUser: User) => {
    if (!db) return null;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const profile = { uid: firebaseUser.uid, ...docSnap.data() } as UserProfile;

      // Força o papel de administrador para o Dr. Jhalim Stewart
      if (profile.name === 'Dr. Jhalim Stewart') {
        profile.role = 'admin';
        profile.specialty = 'Administrador do Sistema';
      }
      
      return profile;
    }
    // Admin fallback - if user is authenticated but has no profile, assume they are the admin.
    // In a real app, you would have a more secure way to identify admins.
    return {
      uid: ADMIN_UID,
      name: 'Dr. Admin',
      email: firebaseUser.email || 'admin@medicloud.com',
      specialty: 'Administrador do Sistema',
      role: 'admin',
      signature: null
    } as UserProfile;
  }, []);

  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user || !db) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, data, { merge: true });
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o perfil.' });
    }
  }, [user, toast]);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profile = await fetchUserProfile(firebaseUser);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/' || pathname === '/register';
    
    if (!user && !isAuthPage) {
      router.push('/');
    }
    
    if (user && isAuthPage) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);


  if (loading) {
    return <FullscreenLoader />;
  }

  const contextValue: AuthContextType = {
    user,
    userProfile,
    loading,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
