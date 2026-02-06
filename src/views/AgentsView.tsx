import { motion } from 'framer-motion';
import { AgentsList } from '@/components/AgentsList';
import { useDocuments } from '@/contexts/DocumentsContext';
import { Bot, Plus, FileText, Wand2 } from 'lucide-react';

export function AgentsView() {
  const { agents } = useDocuments();

  const totalOutputs = agents.reduce((sum, a) => sum + (a.outputCount || 0), 0);
  const customCount = agents.filter(a => !a.isPreset).length;

  return (
    <div className="min-h-full px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
        <p className="text-xl text-muted-foreground font-normal">
          AI agents continuously monitoring your product signals
        </p>
        
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Add Agent
        </button>
      </motion.div>
      
      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-6 md:grid-cols-3 mb-10"
      >
        <div className="bg-card border border-border/30 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground leading-none">{agents.length}</p>
              <p className="text-sm text-muted-foreground font-medium mt-1">Active agents</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border/30 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground leading-none">{totalOutputs}</p>
              <p className="text-sm text-muted-foreground font-medium mt-1">Total outputs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border/30 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Wand2 className="w-4 h-4 text-accent-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground leading-none">{customCount}</p>
              <p className="text-sm text-muted-foreground font-medium mt-1">Custom agents</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Agents list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card border border-border/30 rounded-3xl p-6 md:p-8"
      >
        <AgentsList agents={agents} />
      </motion.div>
    </div>
  );
}
