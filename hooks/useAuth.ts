'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

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

  const login = async (username: string, password: string) => {
    const success = AuthService.login(username, password);

    if (success) {
      setIsAuthenticated(true);
      setUser(username);
      router.push('/dashboard');
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

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  };
}