import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Insight } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  Target, 
  Lightbulb, 
  BarChart3,
  Users,
  Zap,
  LineChart,
  PieChart,
  MessageSquare,
  Clock,
  type LucideIcon
} from 'lucide-react';

interface InsightCardProps {
  insight: Insight;
  index: number;
  usedIcons: Set<string>;
  onIconUsed: (iconName: string) => void;
  onClick?: () => void;
}

// Agent type to icon mapping
const agentIcons: Record<string, { icon: LucideIcon; name: string }> = {
  'risk-scanner': { icon: AlertTriangle, name: 'AlertTriangle' },
  'retention-monitor': { icon: Activity, name: 'Activity' },
  'adoption-tracker': { icon: Target, name: 'Target' },
  'insight-synthesizer': { icon: Lightbulb, name: 'Lightbulb' },
  'trend-summarizer': { icon: TrendingUp, name: 'TrendingUp' },
};

// Content-relevant fallback icons (used when agent icon is already displayed)
const contentFallbackIcons: { icon: LucideIcon; name: string }[] = [
  { icon: BarChart3, name: 'BarChart3' },
  { icon: Users, name: 'Users' },
  { icon: Zap, name: 'Zap' },
  { icon: LineChart, name: 'LineChart' },
  { icon: PieChart, name: 'PieChart' },
  { icon: MessageSquare, name: 'MessageSquare' },
  { icon: Clock, name: 'Clock' },
  { icon: Sparkles, name: 'Sparkles' },
  { icon: FileText, name: 'FileText' },
];

// Helper to get agent type from source id
const getAgentType = (sourceId: string): string | null => {
  const agentTypes: Record<string, string> = {
    'preset-a1': 'risk-scanner',
    'preset-a2': 'retention-monitor',
    'preset-a3': 'adoption-tracker',
    'preset-a4': 'insight-synthesizer',
    'preset-a5': 'trend-summarizer',
  };
  return agentTypes[sourceId] || null;
};

export function InsightCard({
  insight,
  index,
  usedIcons,
  onIconUsed,
  onClick
}: InsightCardProps) {
  const navigate = useNavigate();
  
  // Get the appropriate icon for this card
  const getIcon = (): { Icon: LucideIcon; iconName: string } => {
    const agentType = getAgentType(insight.source.id);
    
    // If agent has a specific icon and it hasn't been used yet
    if (agentType && agentIcons[agentType] && !usedIcons.has(agentIcons[agentType].name)) {
      return { Icon: agentIcons[agentType].icon, iconName: agentIcons[agentType].name };
    }
    
    // Find a content-relevant fallback that hasn't been used
    for (const fallback of contentFallbackIcons) {
      if (!usedIcons.has(fallback.name)) {
        return { Icon: fallback.icon, iconName: fallback.name };
      }
    }
    
    // Last resort: use FileText
    return { Icon: FileText, iconName: 'FileText-fallback' };
  };

  const { Icon, iconName } = getIcon();
  
  // Register icon as used on mount
  if (!usedIcons.has(iconName)) {
    onIconUsed(iconName);
  }

  // Create varied layouts based on index
  const layoutVariant = index % 4;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    navigate(`/insight/${insight.id}`);
  };

  // Featured card (first one) - dark themed
  if (layoutVariant === 0) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.08,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="bg-foreground rounded-xl p-6 cursor-pointer group min-h-[260px] flex flex-col"
        onClick={handleClick}
      >
        <h3 className="text-lg font-medium text-background leading-snug mb-auto">
          {insight.title}
        </h3>
        
        <div className="mt-8">
          <div className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center mb-4">
            <Icon className="w-4 h-4 text-background/50" strokeWidth={1.5} />
          </div>
          
          <div className="flex items-center gap-2 text-background/40 text-sm">
            <span>{insight.source.name}</span>
            <span>·</span>
            <span>{formatDistanceToNow(insight.timestamp, { addSuffix: false })}</span>
          </div>
        </div>
      </motion.article>
    );
  }

  // Quote/question style card
  if (layoutVariant === 1) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.08,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="insight-card cursor-pointer group min-h-[260px] flex flex-col"
        onClick={handleClick}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-muted-foreground text-sm">Ask</span>
          {insight.isNew && (
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
          )}
        </div>
        
        <h3 className="text-base font-medium text-foreground leading-snug mb-auto">
          "{insight.synthesis}"
        </h3>
        
        <div className="mt-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="text-sm text-muted-foreground">
            <span>{insight.evidenceCount} sources</span>
            <span className="mx-1.5">·</span>
            <span>{formatDistanceToNow(insight.timestamp, { addSuffix: false })}</span>
          </div>
        </div>
      </motion.article>
    );
  }

  // Visual emphasis card with large icon
  if (layoutVariant === 2) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.08,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="insight-card cursor-pointer group min-h-[260px] flex flex-col"
        onClick={handleClick}
      >
        <h3 className="text-base font-medium text-foreground leading-snug mb-6">
          {insight.title}
        </h3>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center">
            <Icon className="w-5 h-5 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
        </div>
        
        <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground">
          <span>{insight.source.name}</span>
          <span>·</span>
          <span>{formatDistanceToNow(insight.timestamp, { addSuffix: false })}</span>
        </div>
      </motion.article>
    );
  }

  // Minimal card with confidence indicator
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="insight-card cursor-pointer group min-h-[260px] flex flex-col"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="px-2 py-0.5 rounded text-xs bg-muted/50 text-muted-foreground">
          {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
        </span>
        {insight.isNew && (
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
        )}
      </div>
      
      <h3 className="text-base font-medium text-foreground leading-snug mb-auto">
        {insight.title}
      </h3>
      
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 bg-muted/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground/30 rounded-full"
              style={{ width: `${insight.confidence * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {Math.round(insight.confidence * 100)}%
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{insight.evidenceCount} sources</span>
          <span>·</span>
          <span>{formatDistanceToNow(insight.timestamp, { addSuffix: false })}</span>
        </div>
      </div>
    </motion.article>
  );
}
