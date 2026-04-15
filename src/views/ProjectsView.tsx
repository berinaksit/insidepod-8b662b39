import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  FolderOpen, 
  Plus, 
  Upload, 
  File, 
  FileText, 
  FileSpreadsheet, 
  Search,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProjects, Project, ProjectFile } from '@/contexts/ProjectsContext';
import { CreateProjectModal } from '@/components/CreateProjectModal';

interface ProjectsViewProps {
  onBack: () => void;
}

const fileTypeIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  csv: FileSpreadsheet,
  docx: File,
};

const fileTypeBadgeColors: Record<string, string> = {
  pdf: 'bg-destructive/10 text-destructive',
  csv: 'bg-accent/10 text-accent',
  docx: 'bg-primary/10 text-primary',
};

export function ProjectsView({ onBack }: ProjectsViewProps) {
  const {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createProject,
    getFilesForProject,
    addFileToProject,
  } = useProjects();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeProjectFiles = activeProjectId ? getFilesForProject(activeProjectId) : [];

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="px-4 sm:px-6 py-6 sm:py-8"
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl text-foreground">
              Projects
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Organize your research and documents
            </p>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-border bg-card"
            />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 rounded-xl w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            New project
          </Button>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Projects List */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-card rounded-xl sm:rounded-2xl border border-border/50 p-3 sm:p-4 shadow-card">
              <h2 className="text-sm font-medium text-muted-foreground mb-3 sm:mb-4">
                All Projects ({filteredProjects.length})
              </h2>

              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <FolderOpen className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first project to get started
                  </p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="outline"
                    className="gap-1.5 rounded-xl"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                    Create project
                  </Button>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="w-6 h-6 text-muted-foreground mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">No projects match "{searchQuery}"</p>
                </div>
              ) : (
                <ScrollArea className="h-[200px] sm:h-[calc(100vh-380px)]">
                  <div className="space-y-2 pr-2">
                    {filteredProjects.map((project, index) => {
                      const fileCount = getFilesForProject(project.id).length;
                      const isActive = project.id === activeProjectId;

                      return (
                        <motion.button
                          key={project.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          onClick={() => handleProjectClick(project)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            isActive
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-foreground truncate">
                              {project.name}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {fileCount} file{fileCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Updated {format(project.updatedAt, 'MMM d, yyyy')}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Files Section */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-card rounded-xl sm:rounded-2xl border border-border/50 p-3 sm:p-4 shadow-card">
              {activeProject ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {activeProject.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {activeProjectFiles.length} file{activeProjectFiles.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      onClick={handleUploadClick}
                      variant="outline"
                      className="gap-1.5 rounded-xl w-full sm:w-auto"
                    >
                      <Upload className="w-4 h-4" strokeWidth={1.5} />
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
                    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
                      <Upload className="w-6 h-6 text-muted-foreground mb-4" strokeWidth={1.5} />
                      <h3 className="text-lg font-medium text-foreground mb-2">No files yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload PDF, CSV, or DOCX files to this project
                      </p>
                      <Button
                        onClick={handleUploadClick}
                        variant="outline"
                        className="gap-1.5 rounded-xl"
                      >
                        <Upload className="w-4 h-4" strokeWidth={1.5} />
                        Upload files
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px] sm:h-[calc(100vh-380px)]">
                      <div className="space-y-2 pr-2">
                        {activeProjectFiles.map((file, index) => {
                          const FileIcon = fileTypeIcons[file.type] || File;
                          const badgeColor = fileTypeBadgeColors[file.type] || 'bg-muted text-muted-foreground';

                          return (
                            <motion.div
                              key={file.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.03 }}
                              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:border-primary/30 transition-colors"
                            >
                              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                                <FileIcon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {file.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Uploaded {format(file.uploadedAt, 'MMM d, yyyy \'at\' h:mm a')}
                                </p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase ${badgeColor}`}>
                                {file.type}
                              </span>
                              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <FolderOpen className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Select a project
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Choose a project from the list to view and manage its files
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
