import { motion } from 'framer-motion';
import { Agent } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  Sparkles, 
  BarChart3,
  Wand2
} from 'lucide-react';

interface AgentsListProps {
  agents: Agent[];
  onAgentClick?: (agent: Agent) => void;
}

const agentIcons: Record<string, React.ElementType> = {
  'risk-scanner': Shield,
  'retention-monitor': Activity,
  'adoption-tracker': TrendingUp,
  'insight-synthesizer': Sparkles,
  'trend-summarizer': BarChart3,
  'custom': Wand2,
};

export function AgentsList({ agents, onAgentClick }: AgentsListProps) {
  // Sort agents: custom agents first (newest first), then preset agents
  const sortedAgents = [...agents].sort((a, b) => {
    // Custom agents come first
    if (!a.isPreset && b.isPreset) return -1;
    if (a.isPreset && !b.isPreset) return 1;
    
    // Among custom agents, sort by createdAt (newest first)
    if (!a.isPreset && !b.isPreset) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    // Keep preset agents in their original order
    return 0;
  });

  return (
    <div className="flex flex-col">
      {sortedAgents.map((agent, index) => {
        const Icon = agentIcons[agent.type] || Wand2;
        const isInactive = !agent.isActive;
        const isCustom = !agent.isPreset;
        
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            className={index < sortedAgents.length - 1 ? 'border-b border-border pb-4 mb-4' : ''}
          >
            <button
              onClick={() => onAgentClick?.(agent)}
              className={`w-full text-left flex flex-col md:flex-row md:items-start justify-between gap-3 group ${
                isInactive ? 'opacity-40' : ''
              }`}
            >
              <div className="flex gap-3">
                {/* Icon container */}
                <div className={`flex-shrink-0 icon-container-lg ${
                  isCustom ? 'bg-violet-50' : ''
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isCustom ? 'text-violet-500' : 'text-muted-foreground'
                  }`} strokeWidth={1.5} />
                </div>
                
                {/* Content */}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-sm font-medium text-foreground">
                      {agent.name}
                    </h3>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {agent.outputCount} outputs
                    </span>
                    {isCustom && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-violet-50 text-violet-600">
                        Custom
                      </span>
                    )}
                    {isInactive && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    {agent.description}
                  </p>
                </div>
              </div>
              
              {/* Timestamp */}
              {agent.lastRun && (
                <span className="flex-shrink-0 text-xs text-muted-foreground/60">
                  {formatDistanceToNow(agent.lastRun, { addSuffix: true })}
                </span>
              )}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
