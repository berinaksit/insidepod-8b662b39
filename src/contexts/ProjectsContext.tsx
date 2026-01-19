import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// localStorage keys
const STORAGE_KEYS = {
  projects: 'insidepod_projects',
  activeProjectId: 'insidepod_active_project_id',
  projectFiles: 'insidepod_project_files',
};

// Project type
export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project file type
export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  type: 'pdf' | 'csv' | 'docx';
  size: number;
  uploadedAt: Date;
}

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
  createProject: (name: string) => Project;
  setActiveProjectId: (id: string | null) => void;
  
  // Project files
  projectFiles: ProjectFile[];
  getFilesForProject: (projectId: string) => ProjectFile[];
  addFileToProject: (projectId: string, file: Omit<ProjectFile, 'id' | 'projectId' | 'uploadedAt'>) => ProjectFile;
  
  // Panel state
  isProjectsPanelOpen: boolean;
  setIsProjectsPanelOpen: (open: boolean) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Initialize projects from storage
function initializeProjects(): Project[] {
  const stored = loadFromStorage<Project[]>(STORAGE_KEYS.projects, []);
  return hydrateDates(stored, ['createdAt', 'updatedAt']);
}

// Initialize project files from storage
function initializeProjectFiles(): ProjectFile[] {
  const stored = loadFromStorage<ProjectFile[]>(STORAGE_KEYS.projectFiles, []);
  return hydrateDates(stored, ['uploadedAt']);
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initializeProjects);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>(initializeProjectFiles);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(() => 
    loadFromStorage<string | null>(STORAGE_KEYS.activeProjectId, null)
  );
  const [isProjectsPanelOpen, setIsProjectsPanelOpen] = useState(false);

  // Persist projects to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.projects, projects);
  }, [projects]);

  // Persist project files to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.projectFiles, projectFiles);
  }, [projectFiles]);

  // Persist active project ID to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.activeProjectId, activeProjectId);
  }, [activeProjectId]);

  const createProject = useCallback((name: string): Project => {
    const now = new Date();
    const newProject: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      createdAt: now,
      updatedAt: now,
    };
    
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectIdState(newProject.id);
    
    return newProject;
  }, []);

  const setActiveProjectId = useCallback((id: string | null) => {
    setActiveProjectIdState(id);
  }, []);

  const getFilesForProject = useCallback((projectId: string): ProjectFile[] => {
    return projectFiles.filter(f => f.projectId === projectId);
  }, [projectFiles]);

  const addFileToProject = useCallback((
    projectId: string, 
    file: Omit<ProjectFile, 'id' | 'projectId' | 'uploadedAt'>
  ): ProjectFile => {
    const newFile: ProjectFile = {
      ...file,
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      uploadedAt: new Date(),
    };
    
    setProjectFiles(prev => [...prev, newFile]);
    
    // Update project's updatedAt
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, updatedAt: new Date() }
        : p
    ));
    
    return newFile;
  }, []);

  // Derived values
  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const value: ProjectsContextType = {
    projects,
    activeProject,
    activeProjectId,
    createProject,
    setActiveProjectId,
    projectFiles,
    getFilesForProject,
    addFileToProject,
    isProjectsPanelOpen,
    setIsProjectsPanelOpen,
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
