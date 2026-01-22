import { motion } from 'framer-motion';
import { ArrowLeft, Search, Upload, MessageSquare, FileText, Users, Database, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SourcesOverviewViewProps {
  onClose: () => void;
}

export function SourcesOverviewView({ onClose }: SourcesOverviewViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock sources grouped by type
  const sourceGroups = [
    {
      type: 'Research',
      icon: FileText,
      sources: [
        { name: 'User Research Q1 2025', lastUpdated: '2 days ago', documents: 24 },
        { name: 'Competitor Analysis', lastUpdated: '1 week ago', documents: 8 },
        { name: 'Market Trends Report', lastUpdated: '3 days ago', documents: 15 }
      ]
    },
    {
      type: 'CRM',
      icon: Database,
      sources: [
        { name: 'Salesforce_CRM Data', lastUpdated: '1 hour ago', documents: 1247 },
        { name: 'HubSpot Contacts', lastUpdated: '3 hours ago', documents: 892 }
      ]
    },
    {
      type: 'Interviews',
      icon: Users,
      sources: [
        { name: 'Customer Interviews 2025', lastUpdated: '1 day ago', documents: 41 },
        { name: 'Churned User Interviews', lastUpdated: '5 days ago', documents: 12 },
        { name: 'Enterprise Feedback', lastUpdated: '2 days ago', documents: 8 }
      ]
    },
    {
      type: 'Documents',
      icon: FolderOpen,
      sources: [
        { name: 'Product Roadmap', lastUpdated: '1 week ago', documents: 3 },
        { name: 'Technical Specs', lastUpdated: '2 weeks ago', documents: 17 },
        { name: 'Meeting Transcripts', lastUpdated: '1 day ago', documents: 156 }
      ]
    }
  ];

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
        {filteredGroups.map((group) => {
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
                    key={source.name}
                    className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{source.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated {source.lastUpdated}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {source.documents} docs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="rounded-xl">
          <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Upload new source
        </Button>
        <Button variant="outline" className="rounded-xl">
          <MessageSquare className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Ask a question using these sources
        </Button>
      </div>
    </motion.div>
  );
}
