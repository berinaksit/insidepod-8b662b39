import { motion } from 'framer-motion';
import { Agent } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  Shield, 
  RefreshCw, 
  TrendingUp, 
  Sparkles, 
  BarChart3,
  Loader2,
  Wand2
} from 'lucide-react';

interface AgentsListProps {
  agents: Agent[];
  onAgentClick?: (agent: Agent) => void;
}

const agentIcons: Record<string, React.ElementType> = {
  'risk-scanner': Shield,
  'retention-monitor': RefreshCw,
  'adoption-tracker': TrendingUp,
  'insight-synthesizer': Sparkles,
  'trend-summarizer': BarChart3,
  'custom': Wand2,
};

export function AgentsList({ agents, onAgentClick }: AgentsListProps) {
  const sortedAgents = [...agents].sort((a, b) => {
    if (!a.isPreset && b.isPreset) return -1;
    if (a.isPreset && !b.isPreset) return 1;
    if (!a.isPreset && !b.isPreset) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  return (
    <div className="flex flex-col">
      {sortedAgents.map((agent, index) => {
        const Icon = agentIcons[agent.type] || Wand2;
        const isRunning = agent.status === 'running';
        const isInactive = !agent.isActive;
        const isCustom = !agent.isPreset;
        
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
          >
            <button
              onClick={() => onAgentClick?.(agent)}
              className={`w-full text-left flex flex-col md:flex-row md:items-start justify-between gap-4 py-5 group ${
                isInactive ? 'opacity-50' : ''
              }`}
            >
              <div className="flex gap-4">
                {/* Icon container */}
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                  isInactive
                    ? 'bg-muted/50'
                    : isRunning 
                      ? 'bg-highlight-surface' 
                      : isCustom
                        ? 'bg-muted group-hover:bg-muted/80'
                        : 'bg-muted group-hover:bg-muted/80'
                }`}>
                  {isRunning && !isInactive ? (
                    <Loader2 className="w-5 h-5 text-highlight-foreground animate-spin" />
                  ) : (
                    <Icon className={`w-5 h-5 ${
                      isInactive
                        ? 'text-muted-foreground/50'
                        : 'text-muted-foreground'
                    }`} />
                  )}
                </div>
                
                {/* Content */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <h3 className={`text-base font-medium ${
                      isInactive ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {agent.name}
                    </h3>
                    <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-lg">
                      {agent.outputCount} outputs
                    </span>
                    {isCustom && (
                      <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-lg">
                        Custom
                      </span>
                    )}
                    {isInactive && (
                      <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-lg">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed max-w-xl ${
                    isInactive ? 'text-muted-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {agent.description}
                  </p>
                </div>
              </div>
              
              {/* Timestamp */}
              {agent.lastRun && (
                <span className={`flex-shrink-0 text-xs pt-0.5 ${
                  isInactive ? 'text-muted-foreground/50' : 'text-muted-foreground'
                }`}>
                  {formatDistanceToNow(agent.lastRun, { addSuffix: true })}
                </span>
              )}
            </button>
            
            {/* Subtle divider */}
            {index < sortedAgents.length - 1 && (
              <div className="h-px bg-border/40 w-full" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
