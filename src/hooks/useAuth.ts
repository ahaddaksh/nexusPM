import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/auth';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          firstName: session.user.user_metadata?.firstName || '',
          lastName: session.user.user_metadata?.lastName || '',
          createdAt: session.user.created_at,
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          firstName: session.user.user_metadata?.firstName || '',
          lastName: session.user.user_metadata?.lastName || '',
          createdAt: session.user.created_at,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      // Supabase requires email confirmation by default which means the
      // sign up response might not include an active session/token.
      // Only mark the user as authenticated when we receive a session
      // token so other parts of the app (like ProtectedRoute) don't
      // immediately assume the user is logged in.
      if (response.token) {
        setUser(response.user);
      } else {
        setUser(null);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};