import { motion } from 'framer-motion';
import { AgentsList } from '@/components/AgentsList';
import { mockAgents } from '@/data/mockData';
import { Bot, Play, FileText, RefreshCw } from 'lucide-react';

export function AgentsView() {
  return (
    <div className="min-h-full px-6 py-8">
      {/* Header - subtitle only with Run All button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
        <p className="text-lg text-muted-foreground">
          AI agents continuously monitoring your product signals
        </p>
        
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
          <Play className="w-4 h-4 fill-current" />
          Run All
        </button>
      </motion.div>
      
      {/* Summary cards - horizontal layout with icon left, text right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3 mb-8"
      >
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Bot className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-foreground">{mockAgents.length}</p>
              <p className="text-sm text-muted-foreground">Active agents</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-foreground">
                {mockAgents.reduce((sum, a) => sum + a.outputCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total outputs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-tertiary-surface flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-tertiary-surface-foreground" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-foreground">
                {mockAgents.filter(a => a.status === 'running').length}
              </p>
              <p className="text-sm text-muted-foreground">Currently running</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Agents list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card border border-border/50 rounded-2xl"
      >
        <AgentsList agents={mockAgents} />
      </motion.div>
    </div>
  );
}
