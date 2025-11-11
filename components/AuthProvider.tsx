'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

  // Initialize authentication state
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated();
      const currentUser = AuthService.getCurrentUser();

      setIsAuthenticated(authenticated);
      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Centralized redirect logic
  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    const currentPath = window.location.pathname;
    
    if (isAuthenticated) {
      // If authenticated and on login page, redirect to dashboard
      if (currentPath === '/login') {
        router.push('/dashboard');
      }
    } else {
      // If not authenticated and on protected route, redirect to login
      const protectedRoutes = ['/dashboard', '/kitchen', '/delivery'];
      const isProtectedRoute = protectedRoutes.some(route => 
        currentPath.startsWith(route)
      );
      
      if (isProtectedRoute) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const success = AuthService.login(username, password);

    if (success) {
      setIsAuthenticated(true);
      setUser(username);
      return true;
    }

    return false;
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  };

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