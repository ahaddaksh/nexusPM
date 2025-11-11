import { supabase } from './supabase';
import { User, Team, Department, AllowedDomain, Tag } from '../types';

export const adminService = {
  // Users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async syncUsersFromAuth(): Promise<void> {
    // Note: This requires service role access or a database function
    // For now, we'll use a SQL function approach
    // The migration should have created a sync function
    const { error } = await supabase.rpc('sync_users_from_auth');
    if (error) {
      // Fallback: Try to get current user and sync manually
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email || '',
            firstName: user.user_metadata?.firstName || '',
            lastName: user.user_metadata?.lastName || '',
            role: user.user_metadata?.role || 'member',
            isActive: true,
            createdAt: user.created_at,
            updatedAt: new Date().toISOString(),
          }, {
            onConflict: 'id',
          });
      }
      // Note: Full sync requires admin access or a database function
      throw new Error('Full user sync requires database function. Please run the sync_users_from_auth function in Supabase SQL Editor or use the SQL provided in ADMIN_SETUP.md');
    }
  },

  // Teams
  async getTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async createTeam(data: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        ...data,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return team;
  },

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTeam(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async createDepartment(data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: dept, error } = await supabase
      .from('departments')
      .insert({
        ...data,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return dept;
  },

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDepartment(id: string): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Allowed Domains
  async getAllowedDomains(): Promise<AllowedDomain[]> {
    const { data, error } = await supabase
      .from('allowed_domains')
      .select('*')
      .order('domain');
    if (error) throw error;
    return data || [];
  },

  async createAllowedDomain(data: Omit<AllowedDomain, 'id' | 'createdAt' | 'updatedAt'>): Promise<AllowedDomain> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: domain, error } = await supabase
      .from('allowed_domains')
      .insert({
        ...data,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return domain;
  },

  async updateAllowedDomain(id: string, updates: Partial<AllowedDomain>): Promise<AllowedDomain> {
    const { data, error } = await supabase
      .from('allowed_domains')
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteAllowedDomain(id: string): Promise<void> {
    const { error } = await supabase
      .from('allowed_domains')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async createTag(data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: tag, error } = await supabase
      .from('tags')
      .insert({
        ...data,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return tag;
  },

  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTag(id: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Settings (API Keys, Models)
  async getSettings(): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data || {};
  },

  async updateSettings(settings: Record<string, any>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('settings')
      .upsert({
        id: 'default',
        ...settings,
        updatedBy: user.id,
        updatedAt: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });
    if (error) throw error;
  },
};

