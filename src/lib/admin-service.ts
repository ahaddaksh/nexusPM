import { supabase } from './supabase';
import { User, Team, Department, AllowedDomain, Tag } from '../types';

export const adminService = {
  // Users
  async getUsers(): Promise<User[]> {
    // Try camelCase first (migration uses camelCase)
    let result = await supabase
      .from('users')
      .select('*')
      .order('createdAt', { ascending: false });
    
    // If camelCase fails, try lowercase (PostgreSQL lowercases unquoted)
    if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes('column') || result.error.message?.includes('createdAt'))) {
      result = await supabase
        .from('users')
        .select('*')
        .order('createdat', { ascending: false });
    }
    
    if (result.error) {
      // If table doesn't exist, return empty array instead of throwing
      if (result.error.code === '42P01' || result.error.code === 'PGRST202' || result.error.message?.includes('does not exist')) {
        console.warn('Users table does not exist. Please run the migration.');
        return [];
      }
      throw result.error;
    }
    return result.data || [];
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
      // If RPC function doesn't exist, try manual sync
      if (error.code === '42883' || error.code === 'PGRST202' || error.message?.includes('does not exist') || error.message?.includes('function')) {
        console.warn('sync_users_from_auth function does not exist. Attempting manual sync...');
        // Fallback: Try to get current user and sync manually
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: upsertError } = await supabase
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
          
          if (upsertError) {
            throw new Error(`Failed to sync user: ${upsertError.message}. Please ensure the users table exists and run the migration.`);
          }
          return; // Successfully synced current user
        }
        throw new Error('No authenticated user found. Please log in first.');
      }
      // Other errors
      throw new Error(`Failed to sync users: ${error.message}. Please run the sync_users_from_auth function migration.`);
    }
  },

  // Teams
  async getTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST202' || error.message?.includes('does not exist')) {
        console.warn('Teams table does not exist. Please run the migration.');
        return [];
      }
      throw error;
    }
    // Normalize column names (handle both camelCase and lowercase)
    return (data || []).map((team: any) => ({
      ...team,
      departmentId: team.departmentId || team.departmentid || null,
      teamLeadId: team.teamLeadId || team.teamleadid || null,
      createdAt: team.createdAt || team.createdat || team.created_at,
      updatedAt: team.updatedAt || team.updatedat || team.updated_at,
    }));
  },

  async createTeam(data: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Try camelCase first (migration uses camelCase)
    let result = await supabase
      .from('teams')
      .insert({
        name: data.name,
        description: data.description,
        departmentId: data.departmentId || null,
        teamLeadId: data.teamLeadId || null,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
    
    // If camelCase fails with column error, try lowercase (PostgreSQL lowercases unquoted)
    if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes('column') || result.error.message?.includes('createdAt'))) {
      result = await supabase
        .from('teams')
        .insert({
          name: data.name,
          description: data.description,
          departmentid: data.departmentId || null,
          teamleadid: data.teamLeadId || null,
          createdby: user.id,
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString(),
        })
        .select()
        .single();
    }
    
    if (result.error) throw result.error;
    return result.data;
  },

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
    // Try camelCase first, fallback to lowercase
    const updateDataCamel: any = {};
    const updateDataLower: any = {};
    
    if (updates.name !== undefined) {
      updateDataCamel.name = updates.name;
      updateDataLower.name = updates.name;
    }
    if (updates.description !== undefined) {
      updateDataCamel.description = updates.description;
      updateDataLower.description = updates.description;
    }
    if (updates.departmentId !== undefined) {
      updateDataCamel.departmentId = updates.departmentId;
      updateDataLower.departmentid = updates.departmentId;
    }
    if (updates.teamLeadId !== undefined) {
      updateDataCamel.teamLeadId = updates.teamLeadId;
      updateDataLower.teamleadid = updates.teamLeadId;
    }
    updateDataCamel.updatedAt = new Date().toISOString();
    updateDataLower.updatedat = new Date().toISOString();

    // Try camelCase first
    let result = await supabase
      .from('teams')
      .update(updateDataCamel)
      .eq('id', id)
      .select()
      .single();
    
    // If camelCase fails, try lowercase
    if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes('column'))) {
      result = await supabase
        .from('teams')
        .update(updateDataLower)
        .eq('id', id)
        .select()
        .single();
    }
    
    if (result.error) throw result.error;
    return result.data;
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
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST202' || error.message?.includes('does not exist')) {
        console.warn('Departments table does not exist. Please run the migration.');
        return [];
      }
      throw error;
    }
    // Normalize column names (handle both camelCase and lowercase)
    return (data || []).map((dept: any) => ({
      ...dept,
      createdAt: dept.createdAt || dept.createdat || dept.created_at,
      updatedAt: dept.updatedAt || dept.updatedat || dept.updated_at,
    }));
  },

  async createDepartment(data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Try camelCase first (migration uses camelCase)
    let result = await supabase
      .from('departments')
      .insert({
        name: data.name,
        description: data.description,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
    
    // If camelCase fails with column error, try lowercase (PostgreSQL lowercases unquoted)
    if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes('column') || result.error.message?.includes('createdAt'))) {
      result = await supabase
        .from('departments')
        .insert({
          name: data.name,
          description: data.description,
          createdby: user.id,
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString(),
        })
        .select()
        .single();
    }
    
    if (result.error) throw result.error;
    return result.data;
  },

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
    // Try camelCase first, fallback to lowercase
    const updateDataCamel: any = {};
    const updateDataLower: any = {};
    
    if (updates.name !== undefined) {
      updateDataCamel.name = updates.name;
      updateDataLower.name = updates.name;
    }
    if (updates.description !== undefined) {
      updateDataCamel.description = updates.description;
      updateDataLower.description = updates.description;
    }
    updateDataCamel.updatedAt = new Date().toISOString();
    updateDataLower.updatedat = new Date().toISOString();

    // Try camelCase first
    let result = await supabase
      .from('departments')
      .update(updateDataCamel)
      .eq('id', id)
      .select()
      .single();
    
    // If camelCase fails, try lowercase
    if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes('column'))) {
      result = await supabase
        .from('departments')
        .update(updateDataLower)
        .eq('id', id)
        .select()
        .single();
    }
    
    if (result.error) throw result.error;
    return result.data;
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
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST202' || error.message?.includes('does not exist')) {
        console.warn('Allowed domains table does not exist. Please run the migration.');
        return [];
      }
      throw error;
    }
    // Normalize column names (handle both camelCase and lowercase)
    return (data || []).map((domain: any) => ({
      ...domain,
      isActive: domain.isActive !== undefined ? domain.isActive : (domain.isactive !== undefined ? domain.isactive : (domain.is_active !== undefined ? domain.is_active : true)),
      autoAssignTeamId: domain.autoAssignTeamId || domain.autoassignteamid || domain.auto_assign_team_id || null,
      autoAssignDepartmentId: domain.autoAssignDepartmentId || domain.autoassigndepartmentid || domain.auto_assign_department_id || null,
      createdAt: domain.createdAt || domain.createdat || domain.created_at,
      updatedAt: domain.updatedAt || domain.updatedat || domain.updated_at,
    }));
  },

  async createAllowedDomain(data: Omit<AllowedDomain, 'id' | 'createdAt' | 'updatedAt'>): Promise<AllowedDomain> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Try camelCase first (migration uses camelCase)
    let result = await supabase
      .from('allowed_domains')
      .insert({
        domain: data.domain,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
    
    // If camelCase fails with column error, try lowercase (PostgreSQL lowercases unquoted)
    if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes('column') || result.error.message?.includes('createdAt'))) {
      result = await supabase
        .from('allowed_domains')
        .insert({
          domain: data.domain,
          isactive: data.isActive !== undefined ? data.isActive : true,
          createdby: user.id,
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString(),
        })
        .select()
        .single();
    }
    
    if (result.error) throw result.error;
    return result.data;
  },

  async updateAllowedDomain(id: string, updates: Partial<AllowedDomain>): Promise<AllowedDomain> {
    // Try camelCase first, fallback to lowercase
    const updateDataCamel: any = {};
    const updateDataLower: any = {};
    
    if (updates.domain !== undefined) {
      updateDataCamel.domain = updates.domain;
      updateDataLower.domain = updates.domain;
    }
    if (updates.isActive !== undefined) {
      updateDataCamel.isActive = updates.isActive;
      updateDataLower.isactive = updates.isActive;
    }
    updateDataCamel.updatedAt = new Date().toISOString();
    updateDataLower.updatedat = new Date().toISOString();

    // Try camelCase first
    let result = await supabase
      .from('allowed_domains')
      .update(updateDataCamel)
      .eq('id', id)
      .select()
      .single();
    
    // If camelCase fails, try lowercase
    if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes('column'))) {
      result = await supabase
        .from('allowed_domains')
        .update(updateDataLower)
        .eq('id', id)
        .select()
        .single();
    }
    
    if (result.error) throw result.error;
    return result.data;
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
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST202' || error.message?.includes('does not exist')) {
        console.warn('Tags table does not exist. Please run the migration.');
        return [];
      }
      throw error;
    }
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

  // Project Members
  async getProjectMembers(projectId: string): Promise<Array<User & { role: string; addedBy: string; createdAt: string }>> {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          users:userId (
            id,
            email,
            firstName,
            lastName,
            role,
            isActive
          )
        `)
        .eq('projectId', projectId)
        .order('createdAt', { ascending: false });
      
      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST202' || error.message?.includes('does not exist')) {
          console.warn('Project members table does not exist. Please run the migration.');
          return [];
        }
        throw error;
      }
      
      // Transform the data to flatten the user object
      return (data || []).map((pm: any) => ({
        ...pm.users,
        role: pm.role,
        addedBy: pm.addedBy,
        createdAt: pm.createdAt,
      }));
    } catch (error) {
      console.error('Error fetching project members:', error);
      return [];
    }
  },

  async addProjectMember(projectId: string, userId: string, role: 'owner' | 'member' | 'viewer' = 'member'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('project_members')
      .insert({
        projectId,
        userId,
        role,
        addedBy: user.id,
      });
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('User is already a member of this project');
      }
      throw error;
    }
  },

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('projectId', projectId)
      .eq('userId', userId);
    
    if (error) throw error;
  },

  async updateProjectMemberRole(projectId: string, userId: string, role: 'owner' | 'member' | 'viewer'): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .update({ role })
      .eq('projectId', projectId)
      .eq('userId', userId);
    
    if (error) throw error;
  },
};

