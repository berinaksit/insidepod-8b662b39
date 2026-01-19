import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { FolderOpen, Plus, Upload, File, FileText, FileSpreadsheet } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProjects, Project, ProjectFile } from '@/contexts/ProjectsContext';
import { CreateProjectModal } from './CreateProjectModal';

const fileTypeIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  csv: FileSpreadsheet,
  docx: File,
};

const fileTypeBadgeColors: Record<string, string> = {
  pdf: 'bg-red-100 text-red-700',
  csv: 'bg-green-100 text-green-700',
  docx: 'bg-blue-100 text-blue-700',
};

export function ProjectsPanel() {
  const {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createProject,
    getFilesForProject,
    addFileToProject,
    isProjectsPanelOpen,
    setIsProjectsPanelOpen,
  } = useProjects();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateProject = (name: string) => {
    createProject(name);
  };

  const handleProjectClick = (project: Project) => {
    setActiveProjectId(project.id);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !activeProjectId) return;

    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf' || ext === 'csv' || ext === 'docx') {
        addFileToProject(activeProjectId, {
          name: file.name,
          type: ext as 'pdf' | 'csv' | 'docx',
          size: file.size,
        });
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const activeProjectFiles = activeProjectId ? getFilesForProject(activeProjectId) : [];

  return (
    <>
      <Sheet open={isProjectsPanelOpen} onOpenChange={setIsProjectsPanelOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Projects</SheetTitle>
              <Button 
                size="sm" 
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                New project
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-hidden mt-6">
            {/* Project List Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                All Projects
              </h3>
              
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <FolderOpen className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No projects yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Create your first project to get started
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="space-y-2 pr-4">
                    {projects.map(project => {
                      const fileCount = getFilesForProject(project.id).length;
                      const isActive = project.id === activeProjectId;
                      
                      return (
                        <button
                          key={project.id}
                          onClick={() => handleProjectClick(project)}
                          className={`w-full text-left p-3 rounded-xl border transition-colors ${
                            isActive 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">
                              {project.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {fileCount} file{fileCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Updated {format(project.updatedAt, 'MMM d, yyyy')}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Files Section - Only show if a project is selected */}
            {activeProject && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Files
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUploadClick}
                    className="gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    Upload files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.csv,.docx"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {activeProjectFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-xl">
                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No files yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Upload PDF, CSV, or DOCX files
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-2 pr-4">
                      {activeProjectFiles.map(file => {
                        const FileIcon = fileTypeIcons[file.type] || File;
                        const badgeColor = fileTypeBadgeColors[file.type] || 'bg-muted text-muted-foreground';
                        
                        return (
                          <div
                            key={file.id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                          >
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <FileIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(file.uploadedAt, 'MMM d, yyyy')}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${badgeColor}`}>
                              {file.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateProject={handleCreateProject}
      />
    </>
  );
}
