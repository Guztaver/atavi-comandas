'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { User } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();
  const [sessionTimeout, setSessionTimeout] = useState(false);

  // Add timeout for session loading
  useEffect(() => {
    if (isPending) {
      const timer = setTimeout(() => {
        setSessionTimeout(true);
        console.warn('Session loading timeout - there may be an authentication issue');
      }, 5000); // Reduced to 5 second timeout

      return () => clearTimeout(timer);
    } else {
      setSessionTimeout(false);
    }
  }, [isPending]);

  const isAuthenticated = !!session && !error;
  const isLoading = isPending && !sessionTimeout;

  // Debug logging for authentication state
  useEffect(() => {
    console.log('AuthProvider state:', {
      isPending,
      isAuthenticated,
      hasError: !!error,
      hasSession: !!session,
      sessionTimeout,
      userId: session?.user?.id
    });
  }, [isPending, isAuthenticated, error, session, sessionTimeout]);

  // Convert Better Auth session user to our User type
  const user: User | null = session?.user ? {
    id: session.user.id,
    username: session.user.email?.split('@')[0] || 'user',
    email: session.user.email || '',
    role: ((session.user as any).role as 'admin' | 'kitchen' | 'delivery') || 'kitchen',
    created_at: new Date(),
  } : null;

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { signIn } = await import('@/lib/auth-client');
      const result = await signIn.email({
        email,
        password,
      });

      if (result.data) {
        return { success: true };
      }

      return { success: false, error: result.error?.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      router.push('/login');
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };

  // Show loading spinner while checking authentication state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}