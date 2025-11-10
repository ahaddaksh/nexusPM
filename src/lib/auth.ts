import { supabase } from './supabase';
import { User, AuthResponse } from '../types';

class AuthService {
  private userKey = 'user_data';

  async getUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.email!,
      firstName: user.user_metadata?.firstName || '',
      lastName: user.user_metadata?.lastName || '',
      createdAt: user.created_at,
    };
  }

  isAuthenticated(): boolean {
    // This will be checked async in useAuth hook
    return true;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      firstName: data.user.user_metadata?.firstName || '',
      lastName: data.user.user_metadata?.lastName || '',
      createdAt: data.user.created_at,
    };

    return {
      token: data.session?.access_token || '',
      user,
    };
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!authData.user) {
      throw new Error('Registration failed');
    }

    const user: User = {
      id: authData.user.id,
      email: authData.user.email!,
      firstName: data.firstName,
      lastName: data.lastName,
      createdAt: authData.user.created_at,
    };

    return {
      token: authData.session?.access_token || '',
      user,
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem(this.userKey);
    window.location.href = '/login';
  }
}

export const authService = new AuthService();