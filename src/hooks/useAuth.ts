import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/auth';
import { apiClient } from '../lib/api';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserFromDatabase = useCallback(async (authUser: any) => {
    // Always return immediately with auth data, then try to enhance with DB data
    const fallbackUser: User = {
      id: authUser.id,
      email: authUser.email!,
      firstName: authUser.user_metadata?.firstName || '',
      lastName: authUser.user_metadata?.lastName || '',
      role: authUser.user_metadata?.role || 'member',
      createdAt: authUser.created_at,
    };

    try {
      // Try to fetch user from users table with timeout
      // Use maybeSingle() to handle cases where user doesn't exist in table
      // Try lowercase first (PostgreSQL lowercases unquoted identifiers)
      let result = await supabase
        .from('users')
        .select('id, email, firstname, lastname, role, isactive, teamid, departmentid, createdat, updatedat')
        .eq('id', authUser.id)
        .maybeSingle();
      
      // If lowercase fails, try camelCase
      if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes('column'))) {
        result = await supabase
          .from('users')
          .select('id, email, firstName, lastName, role, isActive, teamId, departmentId, createdAt, updatedAt')
          .eq('id', authUser.id)
          .maybeSingle();
      }
      
      // If that also fails, try select('*')
      if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes('column'))) {
        result = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
      }

      // Supabase returns { data, error } format
      if (result && result.error) {
        // If it's a 500 error, RLS error, or 404 (table doesn't exist), try using RPC function as fallback
        if (result.error.code === 'PGRST301' || result.error.status === 500 || result.error.code === 'PGRST202' || 
            result.error.message?.includes('500') || result.error.message?.includes('NOT_FOUND') ||
            result.error.message?.includes('does not exist')) {
          try {
            // Try to get role via RPC function (bypasses RLS)
            const { data: roleData, error: rpcError } = await supabase.rpc('get_current_user_role');
            if (!rpcError && roleData) {
              return {
                ...fallbackUser,
                role: roleData as string || 'member',
              };
            }
          } catch (rpcError) {
            // Ignore RPC errors - table or function might not exist
          }
        }
        // If query failed, return fallback
        return fallbackUser;
      }
      
      // Check if result has data property (Supabase response format)
      if (result && result.data) {
        const dbUser = result.data;
        // User exists in users table, use that data
        // Normalize column names (handle both camelCase and lowercase)
        const normalizedUser = {
          ...dbUser,
          firstName: dbUser.firstName || dbUser.firstname || dbUser.first_name || '',
          lastName: dbUser.lastName || dbUser.lastname || dbUser.last_name || '',
          isActive: dbUser.isActive !== undefined ? dbUser.isActive : (dbUser.isactive !== undefined ? dbUser.isactive : (dbUser.is_active !== undefined ? dbUser.is_active : true)),
          teamId: dbUser.teamId || dbUser.teamid || dbUser.team_id || null,
          departmentId: dbUser.departmentId || dbUser.departmentid || dbUser.department_id || null,
          createdAt: dbUser.createdAt || dbUser.createdat || dbUser.created_at,
          updatedAt: dbUser.updatedAt || dbUser.updatedat || dbUser.updated_at,
        };
        // Normalize role to lowercase to handle case variations
        const normalizedRole = normalizedUser.role ? String(normalizedUser.role).toLowerCase() : 'member';
        return {
          id: normalizedUser.id,
          email: normalizedUser.email,
          firstName: normalizedUser.firstName || authUser.user_metadata?.firstName || '',
          lastName: normalizedUser.lastName || authUser.user_metadata?.lastName || '',
          role: normalizedRole as 'admin' | 'manager' | 'member',
          isActive: normalizedUser.isActive,
          createdAt: normalizedUser.createdAt || authUser.created_at,
        };
      }
    } catch (error: any) {
      // Silently fail and use fallback - don't block the app
      // Only log if it's not a timeout or expected error
      if (error?.message !== 'Query timeout' && error?.code !== 'PGRST116') {
        console.warn('Could not fetch user from database, using auth metadata:', error);
      }
    }

    // Fallback to auth user metadata if users table doesn't have the user or query fails
    return fallbackUser;
  }, []);

  useEffect(() => {
    // Check active session - don't wait for DB query to finish
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Set user immediately from auth, then enhance with DB data
        setUser({
          id: session.user.id,
          email: session.user.email!,
          firstName: session.user.user_metadata?.firstName || '',
          lastName: session.user.user_metadata?.lastName || '',
          role: session.user.user_metadata?.role || 'member',
          createdAt: session.user.created_at,
        });
        apiClient.setToken(session.access_token ?? null);
        
        // Then try to fetch from DB in background (non-blocking)
        fetchUserFromDatabase(session.user).then(userData => {
          setUser(userData);
        }).catch(() => {
          // Ignore errors, we already have auth data
        });
      }
      if (!session?.user) {
        apiClient.setToken(null);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Set user immediately from auth, then enhance with DB data
        setUser({
          id: session.user.id,
          email: session.user.email!,
          firstName: session.user.user_metadata?.firstName || '',
          lastName: session.user.user_metadata?.lastName || '',
          role: session.user.user_metadata?.role || 'member',
          createdAt: session.user.created_at,
        });
        apiClient.setToken(session.access_token ?? null);
        
        // Then try to fetch from DB in background (non-blocking)
        fetchUserFromDatabase(session.user).then(userData => {
          setUser(userData);
        }).catch(() => {
          // Ignore errors, we already have auth data
        });
      } else {
        setUser(null);
        apiClient.setToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserFromDatabase]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      apiClient.setToken(response.token || null);
      // Fetch user from database to get role
      if (response.user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userData = await fetchUserFromDatabase(session.user);
          setUser(userData);
        } else {
          setUser(response.user);
        }
      }
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
      apiClient.setToken(response.token || null);
      // Fetch user from database to get role
      if (response.user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userData = await fetchUserFromDatabase(session.user);
          setUser(userData);
        } else {
          setUser(response.user);
        }
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    apiClient.setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const userData = await fetchUserFromDatabase(session.user);
      setUser(userData);
    }
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };
};