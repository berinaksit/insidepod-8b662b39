import { motion } from 'framer-motion';
import { ArrowLeft, Search, Upload, MessageSquare, FileText, Users, Database, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { useDocuments } from '@/contexts/DocumentsContext';
import { getDocumentIcon, getSourceTypeLabel } from '@/utils/documentSynthesis';
import { formatDistanceToNow } from 'date-fns';

interface SourcesOverviewViewProps {
  onClose: () => void;
}

export function SourcesOverviewView({ onClose }: SourcesOverviewViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { documents, openUploadModal } = useDocuments();

  // Group documents by source type
  const sourceGroups = useMemo(() => {
    if (documents.length === 0) return [];

    // Create a map to group documents by type
    const typeMap: Record<string, {
      type: string;
      icon: typeof FileText;
      sources: { name: string; lastUpdated: string; icon: string; id: string }[];
    }> = {};

    documents.forEach(doc => {
      const sourceType = getSourceTypeLabel(doc);
      const groupKey = sourceType;
      
      if (!typeMap[groupKey]) {
        // Determine icon based on source type
        let groupIcon = FileText;
        if (sourceType.includes('interview') || sourceType.includes('call')) {
          groupIcon = Users;
        } else if (sourceType.includes('data') || sourceType.includes('export')) {
          groupIcon = Database;
        } else {
          groupIcon = FolderOpen;
        }
        
        typeMap[groupKey] = {
          type: sourceType,
          icon: groupIcon,
          sources: []
        };
      }
      
      typeMap[groupKey].sources.push({
        id: doc.id,
        name: doc.aiTitle || doc.name,
        lastUpdated: formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true }),
        icon: getDocumentIcon(doc)
      });
    });

    return Object.values(typeMap);
  }, [documents]);

  const filteredGroups = sourceGroups.map(group => ({
    ...group,
    sources: group.sources.filter(source =>
      source.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.sources.length > 0);

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
          <ArrowLeft className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Connected Sources</h1>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sources..."
          className="w-full bg-muted/50 rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Source Groups */}
      <div className="space-y-8 mb-10">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.type}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <h2 className="text-sm font-medium text-muted-foreground">{group.type}</h2>
                </div>
                <div className="space-y-2">
                  {group.sources.map((source) => (
                    <div
                      key={source.id}
                      className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{source.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">{source.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {source.lastUpdated}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <Upload className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No sources connected</h2>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Upload documents to see them organized here
            </p>
            <Button onClick={() => openUploadModal('sources-overview')} className="rounded-xl">
              <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Upload Document
            </Button>
          </div>
        )}
      </div>

      {/* Actions */}
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl" onClick={() => openUploadModal('sources-overview')}>
            <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Upload new source
          </Button>
          <Button variant="outline" className="rounded-xl">
            <MessageSquare className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Ask a question using these sources
          </Button>
        </div>
      )}
    </motion.div>
  );
}
