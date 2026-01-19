import { useState } from 'react';
import { useProjects } from '@/contexts/ProjectsContext';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen, Plus, FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectSelectionViewProps {
  onProjectSelect: (projectId: string) => void;
}

export function ProjectSelectionView({ onProjectSelect }: ProjectSelectionViewProps) {
  const { projects, createProject, getFilesForProject } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateProject = (name: string) => {
    const newProject = createProject(name);
    onProjectSelect(newProject.id);
  };

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">No projects yet</h1>
          <p className="text-muted-foreground mb-8">
            Create a project to organize files, insights, and goals
          </p>
          <Button size="lg" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create your first project
          </Button>
        </div>

        <CreateProjectModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onCreateProject={handleCreateProject}
        />
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Projects</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const fileCount = getFilesForProject(project.id).length;
          return (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-border hover:border-primary/30"
              onClick={() => onProjectSelect(project.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate mb-1">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {fileCount} {fileCount === 1 ? 'file' : 'files'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
