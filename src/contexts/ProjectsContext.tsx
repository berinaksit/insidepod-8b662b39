import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Project, ProjectFile } from '@/types';

// localStorage keys
const STORAGE_KEYS = {
  projects: 'insidepod_projects',
  projectFiles: 'insidepod_project_files',
  activeProjectId: 'insidepod_active_project_id',
};

// Helper functions for localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
}

// Hydrate dates from JSON
function hydrateDates<T>(obj: T, dateFields: string[]): T {
  if (Array.isArray(obj)) {
    return obj.map(item => hydrateDates(item, dateFields)) as T;
  }
  if (obj && typeof obj === 'object') {
    const hydrated = { ...obj } as any;
    for (const field of dateFields) {
      if (hydrated[field] && typeof hydrated[field] === 'string') {
        hydrated[field] = new Date(hydrated[field]);
      }
    }
    return hydrated;
  }
  return obj;
}

interface ProjectsContextType {
  // Projects
  projects: Project[];
  activeProject: Project | null;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  createProject: (name: string) => Project;
  updateProject: (id: string, updates: Partial<Pick<Project, 'name'>>) => void;
  deleteProject: (id: string) => void;
  hasProjects: boolean;

  // Project Files
  projectFiles: ProjectFile[];
  activeProjectFiles: ProjectFile[];
  addFile: (file: Omit<ProjectFile, 'id' | 'uploadedAt' | 'projectId'>) => ProjectFile;
  addFiles: (files: Omit<ProjectFile, 'id' | 'uploadedAt' | 'projectId'>[]) => ProjectFile[];
  removeFile: (id: string) => void;
  getFilesForProject: (projectId: string) => ProjectFile[];
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Initialize projects from storage
function initializeProjects(): Project[] {
  const stored = loadFromStorage<Project[]>(STORAGE_KEYS.projects, []);
  return hydrateDates(stored, ['createdAt', 'updatedAt']);
}

// Initialize files from storage
function initializeFiles(): ProjectFile[] {
  const stored = loadFromStorage<ProjectFile[]>(STORAGE_KEYS.projectFiles, []);
  return hydrateDates(stored, ['uploadedAt']);
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initializeProjects);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>(initializeFiles);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(() => 
    loadFromStorage<string | null>(STORAGE_KEYS.activeProjectId, null)
  );

  // Persist projects to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.projects, projects);
  }, [projects]);

  // Persist files to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.projectFiles, projectFiles);
  }, [projectFiles]);

  // Persist active project ID
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.activeProjectId, activeProjectId);
  }, [activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const activeProjectFiles = projectFiles.filter(f => f.projectId === activeProjectId);

  const setActiveProjectId = useCallback((id: string | null) => {
    setActiveProjectIdState(id);
  }, []);

  const createProject = useCallback((name: string): Project => {
    const now = new Date();
    const newProject: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      createdAt: now,
      updatedAt: now,
    };
    setProjects(prev => [newProject, ...prev]);
    // Automatically activate the new project
    setActiveProjectIdState(newProject.id);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Pick<Project, 'name'>>) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== id) return project;
      return {
        ...project,
        ...updates,
        updatedAt: new Date(),
      };
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    // Remove all files associated with this project
    setProjectFiles(prev => prev.filter(f => f.projectId !== id));
    // If deleting the active project, clear active state
    if (activeProjectId === id) {
      setActiveProjectIdState(null);
    }
  }, [activeProjectId]);

  const addFile = useCallback((file: Omit<ProjectFile, 'id' | 'uploadedAt' | 'projectId'>): ProjectFile => {
    if (!activeProjectId) {
      throw new Error('No active project');
    }
    const newFile: ProjectFile = {
      ...file,
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: activeProjectId,
      uploadedAt: new Date(),
      contentText: file.contentText || `Uploaded file: ${file.name}. Parsing pending.`,
    };
    setProjectFiles(prev => [...prev, newFile]);
    // Update project's updatedAt timestamp
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId ? { ...p, updatedAt: new Date() } : p
    ));
    return newFile;
  }, [activeProjectId]);

  const addFiles = useCallback((files: Omit<ProjectFile, 'id' | 'uploadedAt' | 'projectId'>[]): ProjectFile[] => {
    if (!activeProjectId) {
      throw new Error('No active project');
    }
    const newFiles: ProjectFile[] = files.map((file, i) => ({
      ...file,
      id: `file-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: activeProjectId,
      uploadedAt: new Date(),
      contentText: file.contentText || `Uploaded file: ${file.name}. Parsing pending.`,
    }));
    setProjectFiles(prev => [...prev, ...newFiles]);
    // Update project's updatedAt timestamp
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId ? { ...p, updatedAt: new Date() } : p
    ));
    return newFiles;
  }, [activeProjectId]);

  const removeFile = useCallback((id: string) => {
    setProjectFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const getFilesForProject = useCallback((projectId: string): ProjectFile[] => {
    return projectFiles.filter(f => f.projectId === projectId);
  }, [projectFiles]);

  const value: ProjectsContextType = {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createProject,
    updateProject,
    deleteProject,
    hasProjects: projects.length > 0,
    projectFiles,
    activeProjectFiles,
    addFile,
    addFiles,
    removeFile,
    getFilesForProject,
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
