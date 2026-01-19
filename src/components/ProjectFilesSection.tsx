import { useRef } from 'react';
import { useProjects } from '@/contexts/ProjectsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, File, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const ACCEPTED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.txt', '.csv'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function getFileIcon(type: string) {
  if (type.includes('pdf')) return <FileText className="w-5 h-5 text-destructive" />;
  if (type.includes('doc')) return <FileText className="w-5 h-5 text-primary" />;
  if (type.includes('csv') || type.includes('spreadsheet')) return <FileText className="w-5 h-5 text-accent-foreground" />;
  if (type.includes('text')) return <FileText className="w-5 h-5 text-muted-foreground" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProjectFilesSection() {
  const { activeProjectFiles, addFiles, removeFile, activeProject } = useProjects();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: { name: string; type: string; size: number }[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Max size is 20MB.`);
        continue;
      }
      validFiles.push({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
      });
    }

    if (validFiles.length > 0) {
      addFiles(validFiles);
      toast.success(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} uploaded`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string, name: string) => {
    removeFile(id);
    toast.success(`${name} removed`);
  };

  // Empty state
  if (activeProjectFiles.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-xl p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
          <Upload className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No files yet</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
          Upload PDF, DOC, TXT, or CSV files to start analyzing data
        </p>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Upload files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">
          Files ({activeProjectFiles.length})
        </h3>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Upload files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <div className="grid gap-2">
        {activeProjectFiles.map((file) => (
          <Card key={file.id} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm truncate">
                    {file.aiTitle || file.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{file.name}</span>
                    {file.size && <span>{formatFileSize(file.size)}</span>}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(file.uploadedAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveFile(file.id, file.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
