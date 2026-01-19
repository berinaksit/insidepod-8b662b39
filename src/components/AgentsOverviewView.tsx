import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Pause, Play, MessageSquare, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/contexts/DocumentsContext';
import { mockAgents } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';

interface AgentsOverviewViewProps {
  onClose: () => void;
}

export function AgentsOverviewView({ onClose }: AgentsOverviewViewProps) {
  const { agents: userAgents } = useDocuments();

  // Combine user agents with mock agents for display
  const allAgents = [
    ...userAgents,
    ...mockAgents.filter(ma => !userAgents.some(ua => ua.id === ma.id))
  ].filter(a => a.isActive);

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
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Active Agents</h1>
        <span className="text-sm text-muted-foreground">
          {allAgents.length} agents running
        </span>
      </div>

      {/* Agents List */}
      <div className="space-y-3 mb-10">
        {allAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Bot className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                agent.status === 'running'
                  ? 'bg-green-100 text-green-700'
                  : agent.status === 'active'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {agent.status === 'running' ? 'Running' : 'Active'}
              </span>
            </div>

            {/* What it monitors */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Monitors</p>
              <div className="flex flex-wrap gap-2">
                {agent.dataSources.map((source) => (
                  <span
                    key={source}
                    className="px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-foreground capitalize"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>

            {/* Last run */}
            {agent.lastRun && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                <Clock className="w-3.5 h-3.5" />
                <span>Last run {formatDistanceToNow(agent.lastRun, { addSuffix: true })}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" className="rounded-lg text-xs h-8">
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Open agent
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg text-xs h-8">
                <Pause className="w-3.5 h-3.5 mr-1.5" />
                Pause agent
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg text-xs h-8">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Ask agent a question
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {allAgents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Bot className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No active agents</h2>
          <p className="text-muted-foreground text-center max-w-sm">
            Create and activate agents to see them here
          </p>
        </div>
      )}
    </motion.div>
  );
}
