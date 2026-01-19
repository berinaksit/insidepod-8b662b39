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
    <div className="flex flex-col space-y-8">
      {sortedAgents.map((agent, index) => {
        const Icon = agentIcons[agent.type] || Wand2;
        const isRiskScanner = agent.type === 'risk-scanner';
        const isRunning = agent.status === 'running';
        const isInactive = !agent.isActive;
        const isCustom = !agent.isPreset;
        
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <button
              onClick={() => onAgentClick?.(agent)}
              className={`w-full text-left flex flex-col md:flex-row md:items-start justify-between gap-4 group ${
                isInactive ? 'opacity-50' : ''
              }`}
            >
              <div className="flex gap-4">
                {/* Rounded-xl icon container */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isInactive
                    ? 'bg-muted/50'
                    : isRunning 
                      ? 'bg-emerald-100 dark:bg-emerald-950' 
                      : isCustom
                        ? 'bg-violet-100 dark:bg-violet-950 group-hover:bg-violet-200 dark:group-hover:bg-violet-900'
                        : isRiskScanner 
                          ? 'bg-blue-600 group-hover:bg-blue-700' 
                          : 'bg-muted group-hover:bg-muted/80'
                }`}>
                  {isRunning && !isInactive ? (
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Icon className={`w-5 h-5 ${
                      isInactive
                        ? 'text-muted-foreground/50'
                        : isCustom
                          ? 'text-violet-600 dark:text-violet-400'
                          : isRiskScanner 
                            ? 'text-white' 
                            : 'text-muted-foreground'
                    }`} strokeWidth={1.5} />
                  )}
                </div>
                
                {/* Content */}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className={`text-lg font-bold ${
                      isInactive ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {agent.name}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                      isInactive 
                        ? 'text-muted-foreground/70 bg-muted/50' 
                        : 'text-muted-foreground bg-muted'
                    }`}>
                      {agent.outputCount} outputs
                    </span>
                    {isCustom && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        isInactive
                          ? 'text-violet-400/50 bg-violet-100/50 dark:bg-violet-900/30'
                          : 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/50'
                      }`}>
                        Custom
                      </span>
                    )}
                    {isInactive && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/50 px-2 py-0.5 rounded-md">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed max-w-2xl ${
                    isInactive ? 'text-muted-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {agent.description}
                  </p>
                </div>
              </div>
              
              {/* Timestamp */}
              {agent.lastRun && (
                <span className={`flex-shrink-0 text-xs font-medium pt-1 ${
                  isInactive ? 'text-muted-foreground/50' : 'text-muted-foreground'
                }`}>
                  {formatDistanceToNow(agent.lastRun, { addSuffix: true })}
                </span>
              )}
            </button>
            
            {/* Divider - hide for last item */}
            {index < sortedAgents.length - 1 && (
              <div className="h-px bg-border/50 w-full mt-8" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
