import { supabase } from './supabase';
import { ProjectRisk, ProjectBudgetItem, ProjectMilestone } from '../types';

// Project Risks Service
export const projectRisksService = {
  async getRisks(projectId: string): Promise<ProjectRisk[]> {
    let result = await supabase
      .from('project_risks')
      .select('*')
      .eq('projectId', projectId)
      .order('riskScore', { ascending: false });

    if (result.error && (
      result.error.code === 'PGRST204' || 
      result.error.code === '42703' ||
      result.error.status === 400 ||
      result.error.message?.includes('column') ||
      result.error.message?.includes('projectid')
    )) {
      result = await supabase
        .from('project_risks')
        .select('*')
        .eq('projectid', projectId)
        .order('riskscore', { ascending: false });
    }

    if (result.error) throw result.error;

    return (result.data || []).map((r: any) => ({
      id: r.id,
      projectId: r.projectId || r.projectid || r.project_id,
      title: r.title,
      description: r.description,
      riskCategory: r.riskCategory || r.riskcategory || r.risk_category,
      probability: r.probability,
      impact: r.impact,
      riskScore: r.riskScore || r.riskscore || r.risk_score || 0,
      status: r.status,
      mitigationStrategy: r.mitigationStrategy || r.mitigationstrategy || r.mitigation_strategy,
      mitigationOwner: r.mitigationOwner || r.mitigationowner || r.mitigation_owner,
      targetMitigationDate: r.targetMitigationDate || r.targetmitigationdate || r.target_mitigation_date,
      actualMitigationDate: r.actualMitigationDate || r.actualmitigationdate || r.actual_mitigation_date,
      createdBy: r.createdBy || r.createdby || r.created_by,
      createdAt: r.createdAt || r.createdat || r.created_at,
      updatedAt: r.updatedAt || r.updatedat || r.updated_at,
    }));
  },

  async createRisk(data: Omit<ProjectRisk, 'id' | 'riskScore' | 'createdAt' | 'updatedAt'>): Promise<ProjectRisk> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let result = await supabase
      .from('project_risks')
      .insert({
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        riskCategory: data.riskCategory,
        probability: data.probability,
        impact: data.impact,
        status: data.status || 'identified',
        mitigationStrategy: data.mitigationStrategy,
        mitigationOwner: data.mitigationOwner,
        targetMitigationDate: data.targetMitigationDate,
        createdBy: user.id,
      })
      .select('*')
      .single();

    if (result.error && (
      result.error.code === 'PGRST204' || 
      result.error.code === '42703' ||
      result.error.status === 400 ||
      result.error.message?.includes('column')
    )) {
      result = await supabase
        .from('project_risks')
        .insert({
          projectid: data.projectId,
          title: data.title,
          description: data.description,
          riskcategory: data.riskCategory,
          probability: data.probability,
          impact: data.impact,
          status: data.status || 'identified',
          mitigationstrategy: data.mitigationStrategy,
          mitigationowner: data.mitigationOwner,
          targetmitigationdate: data.targetMitigationDate,
          createdby: user.id,
        })
        .select('*')
        .single();
    }

    if (result.error) throw result.error;

    const r = result.data;
    return {
      id: r.id,
      projectId: r.projectId || r.projectid || r.project_id,
      title: r.title,
      description: r.description,
      riskCategory: r.riskCategory || r.riskcategory || r.risk_category,
      probability: r.probability,
      impact: r.impact,
      riskScore: r.riskScore || r.riskscore || r.risk_score || 0,
      status: r.status,
      mitigationStrategy: r.mitigationStrategy || r.mitigationstrategy || r.mitigation_strategy,
      mitigationOwner: r.mitigationOwner || r.mitigationowner || r.mitigation_owner,
      targetMitigationDate: r.targetMitigationDate || r.targetmitigationdate || r.target_mitigation_date,
      actualMitigationDate: r.actualMitigationDate || r.actualmitigationdate || r.actual_mitigation_date,
      createdBy: r.createdBy || r.createdby || r.created_by,
      createdAt: r.createdAt || r.createdat || r.created_at,
      updatedAt: r.updatedAt || r.updatedat || r.updated_at,
    };
  },

  async updateRisk(id: string, updates: Partial<ProjectRisk>): Promise<ProjectRisk> {
    let updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.riskCategory !== undefined) updateData.riskCategory = updates.riskCategory;
    if (updates.probability !== undefined) updateData.probability = updates.probability;
    if (updates.impact !== undefined) updateData.impact = updates.impact;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.mitigationStrategy !== undefined) updateData.mitigationStrategy = updates.mitigationStrategy;
    if (updates.mitigationOwner !== undefined) updateData.mitigationOwner = updates.mitigationOwner;
    if (updates.targetMitigationDate !== undefined) updateData.targetMitigationDate = updates.targetMitigationDate;
    if (updates.actualMitigationDate !== undefined) updateData.actualMitigationDate = updates.actualMitigationDate;

    let result = await supabase
      .from('project_risks')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (result.error && (
      result.error.code === 'PGRST204' || 
      result.error.code === '42703' ||
      result.error.status === 400 ||
      result.error.message?.includes('column')
    )) {
      const updateDataLower: any = {};
      if (updates.title !== undefined) updateDataLower.title = updates.title;
      if (updates.description !== undefined) updateDataLower.description = updates.description;
      if (updates.riskCategory !== undefined) updateDataLower.riskcategory = updates.riskCategory;
      if (updates.probability !== undefined) updateDataLower.probability = updates.probability;
      if (updates.impact !== undefined) updateDataLower.impact = updates.impact;
      if (updates.status !== undefined) updateDataLower.status = updates.status;
      if (updates.mitigationStrategy !== undefined) updateDataLower.mitigationstrategy = updates.mitigationStrategy;
      if (updates.mitigationOwner !== undefined) updateDataLower.mitigationowner = updates.mitigationOwner;
      if (updates.targetMitigationDate !== undefined) updateDataLower.targetmitigationdate = updates.targetMitigationDate;
      if (updates.actualMitigationDate !== undefined) updateDataLower.actualmitigationdate = updates.actualMitigationDate;

      result = await supabase
        .from('project_risks')
        .update(updateDataLower)
        .eq('id', id)
        .select('*')
        .single();
    }

    if (result.error) throw result.error;

    const r = result.data;
    return {
      id: r.id,
      projectId: r.projectId || r.projectid || r.project_id,
      title: r.title,
      description: r.description,
      riskCategory: r.riskCategory || r.riskcategory || r.risk_category,
      probability: r.probability,
      impact: r.impact,
      riskScore: r.riskScore || r.riskscore || r.risk_score || 0,
      status: r.status,
      mitigationStrategy: r.mitigationStrategy || r.mitigationstrategy || r.mitigation_strategy,
      mitigationOwner: r.mitigationOwner || r.mitigationowner || r.mitigation_owner,
      targetMitigationDate: r.targetMitigationDate || r.targetmitigationdate || r.target_mitigation_date,
      actualMitigationDate: r.actualMitigationDate || r.actualmitigationdate || r.actual_mitigation_date,
      createdBy: r.createdBy || r.createdby || r.created_by,
      createdAt: r.createdAt || r.createdat || r.created_at,
      updatedAt: r.updatedAt || r.updatedat || r.updated_at,
    };
  },

  async deleteRisk(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_risks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Project Budget Service
export const projectBudgetService = {
  async getBudgetItems(projectId: string): Promise<ProjectBudgetItem[]> {
    let result = await supabase
      .from('project_budget_items')
      .select('*')
      .eq('projectId', projectId)
      .order('createdAt', { ascending: false });

    if (result.error && (
      result.error.code === 'PGRST204' || 
      result.error.code === '42703' ||
      result.error.status === 400 ||
      result.error.message?.includes('column') ||
      result.error.message?.includes('projectid')
    )) {
      result = await supabase
        .from('project_budget_items')
        .select('*')
        .eq('projectid', projectId)
        .order('createdat', { ascending: false });
    }

    if (result.error) throw result.error;

    return (result.data || []).map((b: any) => ({
      id: b.id,
      projectId: b.projectId || b.projectid || b.project_id,
      category: b.category,
      description: b.description,
      budgetedAmount: parseFloat(b.budgetedAmount || b.budgetedamount || b.budgeted_amount || 0),
      actualAmount: parseFloat(b.actualAmount || b.actualamount || b.actual_amount || 0),
      currency: b.currency || 'USD',
      createdBy: b.createdBy || b.createdby || b.created_by,
      createdAt: b.createdAt || b.createdat || b.created_at,
      updatedAt: b.updatedAt || b.updatedat || b.updated_at,
    }));
  },

  async createBudgetItem(data: Omit<ProjectBudgetItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectBudgetItem> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let result = await supabase
      .from('project_budget_items')
      .insert({
        projectId: data.projectId,
        category: data.category,
        description: data.description,
        budgetedAmount: data.budgetedAmount,
        actualAmount: data.actualAmount || 0,
        currency: data.currency || 'USD',
        createdBy: user.id,
      })
      .select('*')
      .single();

    if (result.error && (
      result.error.code === 'PGRST204' || 
      result.error.code === '42703' ||
      result.error.status === 400 ||
      result.error.message?.includes('column')
    )) {
      result = await supabase
        .from('project_budget_items')
        .insert({
          projectid: data.projectId,
          category: data.category,
          description: data.description,
          budgetedamount: data.budgetedAmount,
          actualamount: data.actualAmount || 0,
          currency: data.currency || 'USD',
          createdby: user.id,
        })
        .select('*')
        .single();
    }

    if (result.error) throw result.error;

    const b = result.data;
    return {
      id: b.id,
      projectId: b.projectId || b.projectid || b.project_id,
      category: b.category,
      description: b.description,
      budgetedAmount: parseFloat(b.budgetedAmount || b.budgetedamount || b.budgeted_amount || 0),
      actualAmount: parseFloat(b.actualAmount || b.actualamount || b.actual_amount || 0),
      currency: b.currency || 'USD',
      createdBy: b.createdBy || b.createdby || b.created_by,
      createdAt: b.createdAt || b.createdat || b.created_at,
      updatedAt: b.updatedAt || b.updatedat || b.updated_at,
    };
  },

  async updateBudgetItem(id: string, updates: Partial<ProjectBudgetItem>): Promise<ProjectBudgetItem> {
    let updateData: any = {};
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.budgetedAmount !== undefined) updateData.budgetedAmount = updates.budgetedAmount;
    if (updates.actualAmount !== undefined) updateData.actualAmount = updates.actualAmount;
    if (updates.currency !== undefined) updateData.currency = updates.currency;

    let result = await supabase
      .from('project_budget_items')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (result.error && (
      result.error.code === 'PGRST204' || 
      result.error.code === '42703' ||
      result.error.status === 400 ||
      result.error.message?.includes('column')
    )) {
      const updateDataLower: any = {};
      if (updates.category !== undefined) updateDataLower.category = updates.category;
      if (updates.description !== undefined) updateDataLower.description = updates.description;
      if (updates.budgetedAmount !== undefined) updateDataLower.budgetedamount = updates.budgetedAmount;
      if (updates.actualAmount !== undefined) updateDataLower.actualamount = updates.actualAmount;
      if (updates.currency !== undefined) updateDataLower.currency = updates.currency;

      result = await supabase
        .from('project_budget_items')
        .update(updateDataLower)
        .eq('id', id)
        .select('*')
        .single();
    }

    if (result.error) throw result.error;

    const b = result.data;
    return {
      id: b.id,
      projectId: b.projectId || b.projectid || b.project_id,
      category: b.category,
      description: b.description,
      budgetedAmount: parseFloat(b.budgetedAmount || b.budgetedamount || b.budgeted_amount || 0),
      actualAmount: parseFloat(b.actualAmount || b.actualamount || b.actual_amount || 0),
      currency: b.currency || 'USD',
      createdBy: b.createdBy || b.createdby || b.created_by,
      createdAt: b.createdAt || b.createdat || b.created_at,
      updatedAt: b.updatedAt || b.updatedat || b.updated_at,
    };
  },

  async deleteBudgetItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_budget_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Project Milestones Service
export const projectMilestonesService = {
  async getMilestones(projectId: string): Promise<ProjectMilestone[]> {
    let result = await supabase
      .from('project_milestones')
      .select('*')
      .eq('projectId', projectId)
      .order('targetDate', { ascending: true });

    if (result.error && (
      result.error.code === 'PGRST204' || 
      result.error.code === '42703' ||
      result.error.status === 400 ||
      result.error.message?.includes('column') ||
      result.error.message?.includes('projectid')
    )) {
      result = await supabase
        .from('project_milestones')
        .select('*')
        .eq('projectid', projectId)
        .order('targetdate', { ascending: true });
    }

    if (result.error) throw result.error;

    return (result.data || []).map((m: any) => ({
      id: m.id,
      projectId: m.projectId || m.projectid || m.project_id,
      name: m.name,
      description: m.description,
      targetDate: m.targetDate || m.targetdate || m.target_date,
      completedDate: m.completedDate || m.completeddate || m.completed_date,
      status: m.status,
      createdBy: m.createdBy || m.createdby || m.created_by,
      createdAt: m.createdAt || m.createdat || m.created_at,
      updatedAt: m.updatedAt || m.updatedat || m.updated_at,
    }));
  },

  async createMilestone(data: Omit<ProjectMilestone, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ProjectMilestone> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let result = await supabase
      .from('project_milestones')
      .insert({
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        targetDate: data.targetDate,
        createdBy: user.id,
      })
      .select('*')
      .single();

    if (result.error && (
      result.error.code === 'PGRST204' || 
      result.error.code === '42703' ||
      result.error.status === 400 ||
      result.error.message?.includes('column')
    )) {
      result = await supabase
        .from('project_milestones')
        .insert({
          projectid: data.projectId,
          name: data.name,
          description: data.description,
          targetdate: data.targetDate,
          createdby: user.id,
        })
        .select('*')
        .single();
    }

    if (result.error) throw result.error;

    const m = result.data;
    return {
      id: m.id,
      projectId: m.projectId || m.projectid || m.project_id,
      name: m.name,
      description: m.description,
      targetDate: m.targetDate || m.targetdate || m.target_date,
      completedDate: m.completedDate || m.completeddate || m.completed_date,
      status: m.status || 'pending',
      createdBy: m.createdBy || m.createdby || m.created_by,
      createdAt: m.createdAt || m.createdat || m.created_at,
      updatedAt: m.updatedAt || m.updatedat || m.updated_at,
    };
  },

  async updateMilestone(id: string, updates: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    let updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.targetDate !== undefined) updateData.targetDate = updates.targetDate;
    if (updates.completedDate !== undefined) updateData.completedDate = updates.completedDate;
    if (updates.status !== undefined) updateData.status = updates.status;

    let result = await supabase
      .from('project_milestones')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (result.error && (
      result.error.code === 'PGRST204' || 
      result.error.code === '42703' ||
      result.error.status === 400 ||
      result.error.message?.includes('column')
    )) {
      const updateDataLower: any = {};
      if (updates.name !== undefined) updateDataLower.name = updates.name;
      if (updates.description !== undefined) updateDataLower.description = updates.description;
      if (updates.targetDate !== undefined) updateDataLower.targetdate = updates.targetDate;
      if (updates.completedDate !== undefined) updateDataLower.completeddate = updates.completedDate;
      if (updates.status !== undefined) updateDataLower.status = updates.status;

      result = await supabase
        .from('project_milestones')
        .update(updateDataLower)
        .eq('id', id)
        .select('*')
        .single();
    }

    if (result.error) throw result.error;

    const m = result.data;
    return {
      id: m.id,
      projectId: m.projectId || m.projectid || m.project_id,
      name: m.name,
      description: m.description,
      targetDate: m.targetDate || m.targetdate || m.target_date,
      completedDate: m.completedDate || m.completeddate || m.completed_date,
      status: m.status,
      createdBy: m.createdBy || m.createdby || m.created_by,
      createdAt: m.createdAt || m.createdat || m.created_at,
      updatedAt: m.updatedAt || m.updatedat || m.updated_at,
    };
  },

  async deleteMilestone(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_milestones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

