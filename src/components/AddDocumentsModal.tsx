import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Upload, File, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  aiTitle: string;
}

interface AddDocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentsAdded: (documents: UploadedDocument[]) => void;
  existingDocuments: UploadedDocument[];
}

const generateAITitle = (fileName: string): string => {
  const titles: Record<string, string> = {
    'pdf': 'Analysis Report',
    'doc': 'Strategy Doc',
    'docx': 'Strategy Doc',
    'txt': 'Text Notes',
    'csv': 'Data Export',
  };
  
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const baseTitle = titles[extension] || 'Document';
  
  // Generate a contextual title based on filename
  const name = fileName.toLowerCase();
  if (name.includes('user') || name.includes('customer')) return 'User Insights';
  if (name.includes('sales') || name.includes('revenue')) return 'Sales Data';
  if (name.includes('onboard') || name.includes('activation')) return 'Onboarding Stats';
  if (name.includes('churn') || name.includes('retention')) return 'Churn Analysis';
  if (name.includes('feedback') || name.includes('survey')) return 'User Feedback';
  if (name.includes('metric') || name.includes('kpi')) return 'Key Metrics';
  if (name.includes('report') || name.includes('analysis')) return 'Analysis Report';
  
  return baseTitle;
};

const ACCEPTED_FORMATS = '.pdf,.doc,.docx,.txt,.csv';
const MAX_DOCUMENTS = 3;

export function AddDocumentsModal({ 
  open, 
  onOpenChange, 
  onDocumentsAdded,
  existingDocuments 
}: AddDocumentsModalProps) {
  const [stagedDocuments, setStagedDocuments] = useState<UploadedDocument[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const remainingSlots = MAX_DOCUMENTS - existingDocuments.length;
  const canAddMore = stagedDocuments.length < remainingSlots;

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newDocs: UploadedDocument[] = [];
    const availableSlots = remainingSlots - stagedDocuments.length;
    
    for (let i = 0; i < Math.min(files.length, availableSlots); i++) {
      const file = files[i];
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (['pdf', 'doc', 'docx', 'txt', 'csv'].includes(extension)) {
        newDocs.push({
          id: `doc-${Date.now()}-${i}`,
          name: file.name,
          type: extension,
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

  const handleAddDocuments = () => {
    onDocumentsAdded(stagedDocuments);
    setStagedDocuments([]);
    onOpenChange(false);
  };

  const handleClose = () => {
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
              ${!canAddMore ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            `}
          >
            <input
              type="file"
              accept={ACCEPTED_FORMATS}
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={!canAddMore}
            />
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-foreground font-medium">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, DOC, TXT, CSV • Up to {remainingSlots} document{remainingSlots !== 1 ? 's' : ''}
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
                        <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.aiTitle}</p>
                        <p className="text-xs text-muted-foreground">{doc.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDocuments}
              disabled={stagedDocuments.length === 0}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add documents
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
