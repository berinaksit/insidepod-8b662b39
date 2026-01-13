import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Upload, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDocuments, StoredDocument } from '@/contexts/DocumentsContext';
import { toast } from 'sonner';

interface GlobalUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface StagedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  aiTitle: string;
}

const generateAITitle = (fileName: string): string => {
  const name = fileName.toLowerCase();
  if (name.includes('user') || name.includes('customer')) return 'User Insights';
  if (name.includes('sales') || name.includes('revenue')) return 'Sales Data';
  if (name.includes('onboard') || name.includes('activation')) return 'Onboarding Stats';
  if (name.includes('churn') || name.includes('retention')) return 'Churn Analysis';
  if (name.includes('feedback') || name.includes('survey')) return 'User Feedback';
  if (name.includes('metric') || name.includes('kpi')) return 'Key Metrics';
  if (name.includes('report') || name.includes('analysis')) return 'Analysis Report';
  if (name.includes('interview')) return 'Interview Notes';
  if (name.includes('transcript')) return 'Transcript';
  
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const titles: Record<string, string> = {
    'pdf': 'PDF Document',
    'doc': 'Word Document',
    'docx': 'Word Document',
    'txt': 'Text Notes',
    'csv': 'Data Export',
  };
  
  return titles[extension] || 'Document';
};

const ACCEPTED_FORMATS = '.pdf,.doc,.docx,.txt,.csv';
const MAX_DOCUMENTS = 3;

export function GlobalUploadModal({ 
  open, 
  onOpenChange,
  onSuccess,
}: GlobalUploadModalProps) {
  const { addDocuments, documents } = useDocuments();
  const [stagedDocuments, setStagedDocuments] = useState<StagedDocument[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const remainingSlots = MAX_DOCUMENTS;
  const canAddMore = stagedDocuments.length < remainingSlots;

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newDocs: StagedDocument[] = [];
    const availableSlots = remainingSlots - stagedDocuments.length;
    
    for (let i = 0; i < Math.min(files.length, availableSlots); i++) {
      const file = files[i];
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (['pdf', 'doc', 'docx', 'txt', 'csv'].includes(extension)) {
        newDocs.push({
          id: `staged-${Date.now()}-${i}`,
          name: file.name,
          type: extension,
          size: file.size,
          aiTitle: generateAITitle(file.name),
        });
      }
    }
    
    setStagedDocuments(prev => [...prev, ...newDocs]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeDocument = (id: string) => {
    setStagedDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleAddDocuments = async () => {
    if (stagedDocuments.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Add to global state
    addDocuments(stagedDocuments.map(doc => ({
      name: doc.name,
      type: doc.type,
      size: doc.size,
      source: 'upload' as const,
      sourceLabel: 'File upload',
      aiTitle: doc.aiTitle,
      contentText: `Uploaded file: ${doc.name}. Parsing pending.`,
    })));
    
    toast.success(`${stagedDocuments.length} document${stagedDocuments.length > 1 ? 's' : ''} uploaded successfully`);
    
    setStagedDocuments([]);
    setIsUploading(false);
    onOpenChange(false);
    onSuccess?.();
  };

  const handleClose = () => {
    if (isUploading) return;
    setStagedDocuments([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-0 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Add documents
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Upload area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
              ${isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/20 hover:border-muted-foreground/40'
              }
              ${!canAddMore || isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            `}
          >
            <input
              type="file"
              accept={ACCEPTED_FORMATS}
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={!canAddMore || isUploading}
            />
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-foreground font-medium">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, DOC, TXT, CSV • Up to {remainingSlots} documents
                </p>
              </div>
            </div>
          </div>

          {/* Staged documents */}
          <AnimatePresence>
            {stagedDocuments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {stagedDocuments.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.aiTitle}</p>
                        <p className="text-xs text-muted-foreground">{doc.name}</p>
                      </div>
                    </div>
                    {!isUploading && (
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDocuments}
              disabled={stagedDocuments.length === 0 || isUploading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                  Uploading...
                </>
              ) : (
                'Add documents'
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
