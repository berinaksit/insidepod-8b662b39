import { motion } from 'framer-motion';
import { Agent } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  Shield, 
  Users, 
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
  'retention-monitor': Users,
  'adoption-tracker': TrendingUp,
  'insight-synthesizer': Sparkles,
  'trend-summarizer': BarChart3,
};

const statusColors = {
  active: 'bg-primary/20 text-primary',
  running: 'bg-secondary/20 text-secondary',
  idle: 'bg-muted text-muted-foreground',
};

export function AgentsList({ agents, onAgentClick }: AgentsListProps) {
  return (
    <div className="space-y-2">
      {agents.map((agent, index) => {
        const Icon = agentIcons[agent.type] || Sparkles;
        
        return (
          <motion.button
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onAgentClick?.(agent)}
            className="agent-item w-full text-left"
          >
            <div className={`p-2 rounded-xl ${statusColors[agent.status]}`}>
              {agent.status === 'running' ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin stroke-[2.5]" />
              ) : (
                <Icon className="w-4.5 h-4.5 stroke-[2.5]" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-semibold text-foreground truncate">
                  {agent.name}
                </h4>
                <span className="text-xs text-muted-foreground font-medium">
                  {agent.outputCount} outputs
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate font-medium">
                {agent.description}
              </p>
            </div>
            
            {agent.lastRun && (
              <span className="text-xs text-muted-foreground flex-shrink-0 font-medium">
                {formatDistanceToNow(agent.lastRun, { addSuffix: true })}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
