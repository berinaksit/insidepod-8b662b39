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
    <div className="flex flex-col space-y-8">
      {agents.map((agent, index) => {
        const Icon = agentIcons[agent.type] || Sparkles;
        const isRiskScanner = agent.type === 'risk-scanner';
        const isRunning = agent.status === 'running';
        
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <button
              onClick={() => onAgentClick?.(agent)}
              className="w-full text-left flex flex-col md:flex-row md:items-start justify-between gap-4 group"
            >
              <div className="flex gap-4">
                {/* Rounded-xl icon container */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isRunning 
                    ? 'bg-emerald-100 dark:bg-emerald-950' 
                    : isRiskScanner 
                      ? 'bg-blue-600 group-hover:bg-blue-700' 
                      : 'bg-muted group-hover:bg-muted/80'
                }`}>
                  {isRunning ? (
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Icon className={`w-5 h-5 ${
                      isRiskScanner 
                        ? 'text-white' 
                        : 'text-muted-foreground'
                    }`} strokeWidth={1.5} />
                  )}
                </div>
                
                {/* Content */}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {agent.name}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 bg-muted rounded-md">
                      {agent.outputCount} outputs
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    {agent.description}
                  </p>
                </div>
              </div>
              
              {/* Timestamp */}
              {agent.lastRun && (
                <span className="flex-shrink-0 text-xs text-muted-foreground font-medium pt-1">
                  {formatDistanceToNow(agent.lastRun, { addSuffix: true })}
                </span>
              )}
            </button>
            
            {/* Divider - hide for last item */}
            {index < agents.length - 1 && (
              <div className="h-px bg-border/50 w-full mt-8" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
