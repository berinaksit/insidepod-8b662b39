import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useProjects as useProjectsQuery,
  useCreateProject,
  useProjectFiles as useProjectFilesQuery,
  useAddProjectFile,
  Project,
  ProjectFile,
} from '@/hooks/useSupabaseData';

interface ProjectsContextType {
  // Projects
  projects: Project[];
  activeProject: Project | null;
  activeProjectId: string | null;
  createProject: (name: string) => Promise<Project>;
  setActiveProjectId: (id: string | null) => void;
  isLoading: boolean;
  
  // Project files
  projectFiles: ProjectFile[];
  getFilesForProject: (projectId: string) => ProjectFile[];
  addFileToProject: (projectId: string, file: Omit<ProjectFile, 'id' | 'projectId' | 'uploadedAt'>) => Promise<ProjectFile>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Supabase queries
  const { data: projects = [], isLoading: projectsLoading } = useProjectsQuery();
  const { data: projectFiles = [], isLoading: filesLoading } = useProjectFilesQuery();
  
  // Mutations
  const createProjectMutation = useCreateProject();
  const addFileMutation = useAddProjectFile();
  
  // Local state for active project (in-memory only, resets on refresh)
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);

  const isLoading = projectsLoading || filesLoading;

  const createProjectHandler = useCallback(async (name: string): Promise<Project> => {
    const result = await createProjectMutation.mutateAsync(name);
    
    const newProject: Project = {
      id: result.id,
      name: result.name,
      createdAt: new Date(result.created_at || Date.now()),
      updatedAt: new Date(result.created_at || Date.now()),
    };
    
    // Set as active project
    setActiveProjectIdState(result.id);
    
    return newProject;
  }, [createProjectMutation]);

  const setActiveProjectId = useCallback((id: string | null) => {
    setActiveProjectIdState(id);
  }, []);

  const getFilesForProject = useCallback((projectId: string): ProjectFile[] => {
    return projectFiles.filter(f => f.projectId === projectId);
  }, [projectFiles]);

  const addFileToProjectHandler = useCallback(async (
    projectId: string, 
    file: Omit<ProjectFile, 'id' | 'projectId' | 'uploadedAt'>
  ): Promise<ProjectFile> => {
    const result = await addFileMutation.mutateAsync({ projectId, file });
    
    return {
      id: result.id,
      projectId: result.project_id || projectId,
      name: result.name,
      type: result.type as 'pdf' | 'csv' | 'docx',
      size: result.size || 0,
      uploadedAt: new Date(result.uploaded_at),
    };
  }, [addFileMutation]);

  // Derived values
  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const value: ProjectsContextType = {
    projects,
    activeProject,
    activeProjectId,
    createProject: createProjectHandler,
    setActiveProjectId,
    isLoading,
    projectFiles,
    getFilesForProject,
    addFileToProject: addFileToProjectHandler,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}

// Re-export types for convenience
export type { Project, ProjectFile } from '@/hooks/useSupabaseData';
