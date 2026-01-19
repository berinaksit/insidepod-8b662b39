import { useProjects } from '@/contexts/ProjectsContext';
import { ProjectFilesSection } from '@/components/ProjectFilesSection';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Pencil, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface ProjectWorkspaceViewProps {
  onBack: () => void;
}

export function ProjectWorkspaceView({ onBack }: ProjectWorkspaceViewProps) {
  const { activeProject, updateProject, addFiles } = useProjects();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(activeProject?.name || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeProject) {
    return null;
  }

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== activeProject.name) {
      updateProject(activeProject.id, { name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditedName(activeProject.name);
      setIsEditingName(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileData = Array.from(files).map(file => ({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
    }));

    addFiles(fileData);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-muted-foreground"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          All Projects
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                className="text-2xl font-semibold h-auto py-1 px-2 w-auto max-w-md"
                autoFocus
              />
            ) : (
              <h1 className="text-2xl font-semibold text-foreground">
                {activeProject.name}
              </h1>
            )}
            {!isEditingName && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => {
                  setEditedName(activeProject.name);
                  setIsEditingName(true);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Add files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.csv"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Files Section */}
      <ProjectFilesSection />
    </div>
  );
}
