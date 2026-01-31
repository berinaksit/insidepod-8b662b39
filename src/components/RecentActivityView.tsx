import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Bot, Eye, Play, MessageSquare, Clock, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDocuments } from '@/contexts/DocumentsContext';
import { formatDistanceToNow } from 'date-fns';
import { getDocumentIcon, getSourceTypeLabel } from '@/utils/documentSynthesis';

interface RecentActivityViewProps {
  onClose: () => void;
}

export function RecentActivityView({ onClose }: RecentActivityViewProps) {
  const { documents, agents, openUploadModal } = useDocuments();

  // Create recent uploads from real documents only
  const recentUploads = documents
    .map((doc) => ({
      id: doc.id,
      name: doc.aiTitle || doc.name,
      type: getSourceTypeLabel(doc),
      icon: getDocumentIcon(doc),
      uploadTime: new Date(doc.uploadedAt),
      processedBy: agents.filter(a => a.isActive).slice(0, 2).map(a => a.name)
    }))
    .sort((a, b) => b.uploadTime.getTime() - a.uploadTime.getTime());

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="min-h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" strokeWidth={3} />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Recent Activity</h1>
      </div>

      {/* Recent Uploads List */}
      <div className="space-y-3 mb-10">
        {recentUploads.map((upload, index) => (
          <motion.div
            key={upload.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mt-0.5 text-lg">
                    {upload.icon}
                  </div>
                  <div>
                  <h3 className="font-medium text-foreground">{upload.name}</h3>
                  <p className="text-sm text-muted-foreground">{upload.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" strokeWidth={3} />
                <span>{formatDistanceToNow(upload.uploadTime, { addSuffix: true })}</span>
              </div>
            </div>

            {/* Processed by agents */}
            {upload.processedBy.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Processed by</p>
                <div className="flex flex-wrap gap-2">
                  {upload.processedBy.map((agent) => (
                    <Badge key={agent} variant="neutral" className="flex items-center gap-1.5">
                      <Bot className="w-3 h-3" strokeWidth={3} />
                      {agent}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" className="rounded-lg text-xs h-8">
                <Eye className="w-4 h-4 mr-1.5" strokeWidth={3} />
                View document
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg text-xs h-8">
                <Play className="w-4 h-4 mr-1.5" strokeWidth={3} />
                Run agent
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg text-xs h-8">
                <MessageSquare className="w-4 h-4 mr-1.5" strokeWidth={3} />
                Ask about this
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {recentUploads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Upload className="w-5 h-5 text-muted-foreground" strokeWidth={3} />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No recent uploads</h2>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            Upload documents to see them appear here
          </p>
          <Button onClick={() => openUploadModal('recent-activity')} className="rounded-xl">
            <Upload className="w-4 h-4 mr-2" strokeWidth={3} />
            Upload Document
          </Button>
        </div>
      )}
    </motion.div>
  );
}
