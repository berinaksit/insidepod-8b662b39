import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Agent, Insight, InsightType, AgentType, AgentFrequency, Source } from '@/types';

// ============= Types =============

export interface StoredDocument {
  id: string;
  name: string;
  type: string;
  size?: number;
  source: 'upload' | 'connected';
  sourceLabel?: string;
  uploadedAt: Date;
  aiTitle?: string;
  contentText?: string;
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  type: 'pdf' | 'csv' | 'docx';
  size: number;
  uploadedAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  type: 'KPI' | 'OKR' | 'Success Metric' | 'Custom';
  createdAt: Date;
}

// ============= Documents =============

export function useDocuments() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['documents', user?.id],
    queryFn: async (): Promise<StoredDocument[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(doc => ({
        id: doc.id,
        name: doc.title || 'Untitled',
        type: doc.source_type || 'unknown',
        source: 'upload' as const,
        uploadedAt: new Date(doc.created_at || Date.now()),
        aiTitle: doc.title,
        contentText: doc.content,
        projectId: doc.project_id || undefined,
      }));
    },
    enabled: !!user,
  });
}

export function useAddDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (doc: Omit<StoredDocument, 'id' | 'uploadedAt'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: doc.aiTitle || doc.name,
          content: doc.contentText || `Uploaded file: ${doc.name}`,
          source_type: doc.type,
          project_id: doc.projectId || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useRemoveDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// ============= Projects =============

export function useProjects() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async (): Promise<Project[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        createdAt: new Date(p.created_at || Date.now()),
        updatedAt: new Date(p.created_at || Date.now()),
      }));
    },
    enabled: !!user,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .insert({ name, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ============= Project Files =============

export function useProjectFiles(projectId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['project_files', user?.id, projectId],
    queryFn: async (): Promise<ProjectFile[]> => {
      if (!user) return [];
      
      let query = supabase
        .from('project_files')
        .select('*')
        .eq('user_id', user.id);
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query.order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(f => ({
        id: f.id,
        projectId: f.project_id || '',
        name: f.name,
        type: f.type as 'pdf' | 'csv' | 'docx',
        size: f.size || 0,
        uploadedAt: new Date(f.uploaded_at),
      }));
    },
    enabled: !!user,
  });
}

export function useAddProjectFile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ projectId, file }: { projectId: string; file: Omit<ProjectFile, 'id' | 'projectId' | 'uploadedAt'> }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('project_files')
        .insert({
          user_id: user.id,
          project_id: projectId,
          name: file.name,
          type: file.type,
          size: file.size,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_files'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ============= Agents =============

export function useAgents() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['agents', user?.id],
    queryFn: async (): Promise<Agent[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(a => ({
        id: a.id,
        name: a.name,
        description: a.description || '',
        type: a.type as AgentType,
        prompt: a.prompt || '',
        dataSources: a.data_sources || [],
        frequency: a.frequency as AgentFrequency,
        isActive: a.is_active ?? true,
        isPreset: a.is_preset ?? false,
        createdAt: new Date(a.created_at),
        updatedAt: new Date(a.updated_at),
        status: a.status as 'active' | 'idle' | 'running',
        lastRun: a.last_run ? new Date(a.last_run) : undefined,
        nextRun: a.next_run ? new Date(a.next_run) : undefined,
        outputCount: a.output_count || 0,
        linkedDocumentIds: (a.linked_document_ids || []) as string[],
        attachedFile: a.attached_file_name ? {
          name: a.attached_file_name,
          type: a.attached_file_type || '',
        } : undefined,
      }));
    },
    enabled: !!user,
  });
}

export function useAddAgent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'outputCount' | 'status' | 'isPreset'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('agents')
        .insert({
          user_id: user.id,
          name: agent.name,
          description: agent.description,
          type: agent.type,
          prompt: agent.prompt,
          data_sources: agent.dataSources,
          frequency: agent.frequency,
          is_active: agent.isActive,
          is_preset: false,
          linked_document_ids: agent.linkedDocumentIds,
          attached_file_name: agent.attachedFile?.name,
          attached_file_type: agent.attachedFile?.type,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Agent> }) => {
      const updateData: Record<string, unknown> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.prompt !== undefined) updateData.prompt = updates.prompt;
      if (updates.dataSources !== undefined) updateData.data_sources = updates.dataSources;
      if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.lastRun !== undefined) updateData.last_run = updates.lastRun.toISOString();
      if (updates.nextRun !== undefined) updateData.next_run = updates.nextRun.toISOString();
      if (updates.outputCount !== undefined) updateData.output_count = updates.outputCount;
      if (updates.linkedDocumentIds !== undefined) updateData.linked_document_ids = updates.linkedDocumentIds;
      if (updates.attachedFile !== undefined) {
        updateData.attached_file_name = updates.attachedFile?.name;
        updateData.attached_file_type = updates.attachedFile?.type;
      }
      
      const { error } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

// ============= Insights =============

export function useInsights() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['insights', user?.id],
    queryFn: async (): Promise<Insight[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(i => ({
        id: i.id,
        type: i.type as InsightType,
        title: i.title,
        synthesis: i.synthesis || '',
        source: {
          id: i.source_id || 'unknown',
          name: i.source_name || 'Unknown',
          type: (i.source_type || 'internal') as Source['type'],
        },
        timestamp: new Date(i.timestamp),
        confidence: Number(i.confidence) || 0.8,
        evidenceCount: i.evidence_count || 0,
        isNew: i.is_new ?? true,
        priority: i.priority as 'high' | 'medium' | 'low',
        relatedGoals: (i.related_goals || []) as string[],
      }));
    },
    enabled: !!user,
  });
}

export function useAddInsight() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (insight: Omit<Insight, 'id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('insights')
        .insert({
          user_id: user.id,
          type: insight.type,
          title: insight.title,
          synthesis: insight.synthesis,
          source_id: insight.source.id,
          source_name: insight.source.name,
          source_type: insight.source.type,
          confidence: insight.confidence,
          evidence_count: insight.evidenceCount,
          is_new: insight.isNew ?? true,
          priority: insight.priority || 'medium',
          related_goals: insight.relatedGoals || [],
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

// ============= Goals =============

export function useGoals() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async (): Promise<Goal[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(g => ({
        id: g.id,
        title: g.title,
        type: g.type as Goal['type'],
        createdAt: new Date(g.created_at),
      }));
    },
    enabled: !!user,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goal.title,
          type: goal.type,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
