import { motion } from 'framer-motion';
import { Agent } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  Shield, 
  RefreshCw, 
  TrendingUp, 
  Sparkles, 
  BarChart3,
  Loader2
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
};

export function AgentsList({ agents, onAgentClick }: AgentsListProps) {
  return (
    <div className="divide-y divide-border/50">
      {agents.map((agent, index) => {
        const Icon = agentIcons[agent.type] || Sparkles;
        
        return (
          <motion.button
            key={agent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onAgentClick?.(agent)}
            className="w-full text-left px-6 py-5 flex items-center gap-4 hover:bg-muted/30 transition-colors"
          >
            {/* Icon container */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              agent.status === 'running' 
                ? 'bg-[hsl(145,60%,92%)]' 
                : agent.type === 'risk-scanner' 
                  ? 'bg-[hsl(210,70%,94%)]' 
                  : 'bg-muted'
            }`}>
              {agent.status === 'running' ? (
                <Loader2 className="w-5 h-5 text-[hsl(145,60%,40%)] animate-spin" />
              ) : (
                <Icon className={`w-5 h-5 ${
                  agent.type === 'risk-scanner' 
                    ? 'text-[hsl(210,70%,50%)]' 
                    : 'text-muted-foreground'
                }`} />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <h4 className="font-semibold text-foreground text-base">
                  {agent.name}
                </h4>
                <span className="text-xs text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md font-medium">
                  {agent.outputCount} outputs
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {agent.description}
              </p>
            </div>
            
            {/* Timestamp */}
            {agent.lastRun && (
              <span className="text-sm text-muted-foreground flex-shrink-0">
                {formatDistanceToNow(agent.lastRun, { addSuffix: true })}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
