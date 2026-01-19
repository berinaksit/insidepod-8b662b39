import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Insight } from '@/types';
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
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
  Sparkles,
  type LucideIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

// Helper to get agent display name
const getAgentDisplayName = (sourceId: string): string => {
  const agentNames: Record<string, string> = {
    'preset-a1': 'Risk Scanner',
    'preset-a2': 'Retention Monitor',
    'preset-a3': 'Adoption Tracker',
    'preset-a4': 'Insight Synthesizer',
    'preset-a5': 'Trend Summarizer',
  };
  return agentNames[sourceId] || 'Agent';
};

// Badge type mapping
type BadgeType = 'Signal' | 'Pulse' | 'Insight';

const getBadgeType = (type: string): BadgeType => {
  switch (type) {
    case 'signal':
      return 'Signal';
    case 'pulse':
      return 'Pulse';
    case 'insight':
    default:
      return 'Insight';
  }
};

// Cards that can show badges and buttons (0-indexed positions in grid)
// Middle card first row = index 1, First card second row = index 3, Third card second row = index 5
const cardsWithBadges = [1, 3, 5];

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
  
  // Check if this card should show badge and button
  const showBadgeAndButton = cardsWithBadges.includes(index) && layoutVariant !== 0;
  
  const badgeType = getBadgeType(insight.type);
  const agentName = getAgentDisplayName(insight.source.id);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    navigate(`/insight/${insight.id}`);
  };

  // Featured card (first one) - dark themed - never shows badge/button
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
        <h3 className="text-xl font-semibold text-background leading-snug mb-auto">
          {insight.title}
        </h3>
        
        <div className="mt-8">
          <div className="w-16 h-16 rounded-xl bg-background/10 flex items-center justify-center mb-6">
            <Icon className="w-7 h-7 text-background/70 stroke-[1.5]" />
          </div>
          
          <div className="flex items-center gap-2 text-background/60 text-sm font-medium">
            <span>{agentName} · {insight.evidenceCount} sources</span>
          </div>
        </div>
      </motion.article>
    );
  }

  // Quote/synthesis style card - white
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
        {showBadgeAndButton && (
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-xs font-semibold">
              {badgeType}
            </Badge>
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-foreground leading-snug mb-auto">
          {insight.title}
        </h3>
        
        <div className="mt-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="w-5 h-5 text-muted-foreground stroke-[1.5]" />
          </div>
          {showBadgeAndButton ? (
            <button className="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
              {agentName} · {insight.evidenceCount} sources
            </button>
          ) : (
            <div className="text-sm text-muted-foreground font-medium">
              {agentName} · {insight.evidenceCount} sources
            </div>
          )}
        </div>
      </motion.article>
    );
  }

  // Visual emphasis card with large icon - white
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
        {showBadgeAndButton && (
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-xs font-semibold">
              {badgeType}
            </Badge>
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-foreground leading-snug mb-6">
          {insight.title}
        </h3>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-24 h-24 rounded-2xl bg-muted/80 flex items-center justify-center">
            <Icon className="w-10 h-10 text-muted-foreground stroke-[1.5]" />
          </div>
        </div>
        
        <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground font-medium">
          {showBadgeAndButton ? (
            <button className="hover:text-foreground transition-colors">
              {agentName} · {insight.evidenceCount} sources
            </button>
          ) : (
            <span>{agentName} · {insight.evidenceCount} sources</span>
          )}
        </div>
      </motion.article>
    );
  }

  // Minimal clean card - white
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
      {showBadgeAndButton && (
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-xs font-semibold">
            {badgeType}
          </Badge>
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-foreground leading-snug mb-auto">
        {insight.title}
      </h3>
      
      <div className="mt-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          {showBadgeAndButton ? (
            <button className="hover:text-foreground transition-colors">
              {agentName} · {insight.evidenceCount} sources
            </button>
          ) : (
            <span>{agentName} · {insight.evidenceCount} sources</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
