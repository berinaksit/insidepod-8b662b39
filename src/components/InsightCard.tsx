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

  // Get badge label based on insight type
  const getBadgeLabel = (): string => {
    switch (insight.type) {
      case 'signal': return 'Signal';
      case 'pulse': return 'Pulse';
      case 'insight': return 'Insight';
      default: return 'Insight';
    }
  };

  // Footer text: "{Agent name} · {number of sources} sources"
  const footerText = `${insight.source.name} · ${insight.evidenceCount} sources`;

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.1,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="bg-foreground rounded-2xl p-6 cursor-pointer group min-h-[280px] flex flex-col"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-background/15 text-background/80">
            {getBadgeLabel()}
          </span>
          {insight.isNew && (
            <span className="w-2 h-2 rounded-full bg-background" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-background leading-snug mb-auto">
          {insight.title}
        </h3>
        
        <div className="mt-6">
          <div className="w-14 h-14 rounded-xl bg-background/10 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-background/70 stroke-[1.5]" />
          </div>
          
          <button className="text-sm text-background/60 font-medium hover:text-background/80 transition-colors">
            {footerText}
          </button>
        </div>
      </motion.article>
    );
  }

  // Synthesis quote card
  if (layoutVariant === 1) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.1,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="insight-card cursor-pointer group min-h-[280px] flex flex-col"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
            {getBadgeLabel()}
          </span>
          {insight.isNew && (
            <span className="w-2 h-2 rounded-full bg-foreground" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground leading-snug mb-auto">
          {insight.title}
        </h3>
        
        <div className="mt-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="w-5 h-5 text-muted-foreground stroke-[1.5]" />
          </div>
          <button className="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
            {footerText}
          </button>
        </div>
      </motion.article>
    );
  }

  // Visual emphasis card with large icon
  if (layoutVariant === 2) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.1,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="insight-card cursor-pointer group min-h-[280px] flex flex-col"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
            {getBadgeLabel()}
          </span>
          {insight.isNew && (
            <span className="w-2 h-2 rounded-full bg-foreground" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground leading-snug mb-2">
          {insight.title}
        </h3>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-muted/80 flex items-center justify-center">
            <Icon className="w-9 h-9 text-muted-foreground stroke-[1.5]" />
          </div>
        </div>
        
        <button className="mt-auto text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
          {footerText}
        </button>
      </motion.article>
    );
  }

  // Minimal card with confidence indicator
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="insight-card cursor-pointer group min-h-[280px] flex flex-col"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
          {getBadgeLabel()}
        </span>
        {insight.isNew && (
          <span className="w-2 h-2 rounded-full bg-foreground" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground leading-snug mb-auto">
        {insight.title}
      </h3>
      
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground/60 rounded-full"
              style={{ width: `${insight.confidence * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {Math.round(insight.confidence * 100)}%
          </span>
        </div>
        
        <button className="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
          {footerText}
        </button>
      </div>
    </motion.article>
  );
}
