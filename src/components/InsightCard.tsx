import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Insight } from '@/types';
import { 
  AlertTriangle, 
  Activity, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  BarChart3,
  Users,
  Zap,
  LineChart,
  PieChart,
  MessageSquare,
  Clock,
  Sparkles,
  FileText,
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

// Content-relevant fallback icons
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

// Badge component
const Badge = ({ type }: { type: string }) => {
  const badgeConfig: Record<string, { label: string; className: string }> = {
    signal: { label: 'Signal', className: 'bg-foreground text-background' },
    pulse: { label: 'Pulse', className: 'bg-muted text-muted-foreground' },
    insight: { label: 'Insight', className: 'bg-muted text-muted-foreground' },
  };
  
  const config = badgeConfig[type] || badgeConfig.insight;
  
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
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
  const getIcon = (): { Icon: LucideIcon; iconName: string } | null => {
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
    
    // Return null if all icons are used (hide icon)
    return null;
  };

  const iconData = getIcon();
  
  // Register icon as used on mount
  if (iconData && !usedIcons.has(iconData.iconName)) {
    onIconUsed(iconData.iconName);
  }

  // Create varied layouts based on index
  const layoutVariant = index % 4;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    navigate(`/insight/${insight.id}`);
  };

  // Footer button with agent name and sources
  const FooterButton = () => (
    <button className="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors text-left">
      {insight.source.name} · {insight.evidenceCount} sources
    </button>
  );

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
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-background/20 text-background">
            {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
          </span>
          {insight.isNew && (
            <span className="w-2 h-2 rounded-full bg-background" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-background leading-snug mb-3">
          {insight.title}
        </h3>
        
        <p className="text-sm text-background/70 leading-relaxed mb-auto">
          {insight.synthesis}
        </p>
        
        <div className="mt-6 flex items-center justify-between">
          {iconData && (
            <div className="w-12 h-12 rounded-xl bg-background/10 flex items-center justify-center">
              <iconData.Icon className="w-6 h-6 text-background/70 stroke-[1.5]" />
            </div>
          )}
          <button className="text-sm text-background/60 font-medium hover:text-background transition-colors">
            {insight.source.name} · {insight.evidenceCount} sources
          </button>
        </div>
      </motion.article>
    );
  }

  // Minimal card with badge
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
          <Badge type={insight.type} />
          {insight.isNew && (
            <span className="w-2 h-2 rounded-full bg-foreground" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground leading-snug mb-3">
          {insight.title}
        </h3>
        
        <p className="text-sm text-muted-foreground leading-relaxed mb-auto line-clamp-3">
          {insight.synthesis}
        </p>
        
        <div className="mt-6">
          <FooterButton />
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
          <Badge type={insight.type} />
          {insight.isNew && (
            <span className="w-2 h-2 rounded-full bg-foreground" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground leading-snug mb-4">
          {insight.title}
        </h3>
        
        {iconData && (
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="w-20 h-20 rounded-2xl bg-muted/80 flex items-center justify-center">
              <iconData.Icon className="w-9 h-9 text-muted-foreground stroke-[1.5]" />
            </div>
          </div>
        )}
        
        <div className="mt-auto">
          <FooterButton />
        </div>
      </motion.article>
    );
  }

  // Synthesis-focused card
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
        <Badge type={insight.type} />
        {insight.isNew && (
          <span className="w-2 h-2 rounded-full bg-foreground" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground leading-snug mb-3">
        {insight.title}
      </h3>
      
      <p className="text-sm text-muted-foreground leading-relaxed mb-auto">
        {insight.synthesis}
      </p>
      
      <div className="mt-6 flex items-center gap-3">
        {iconData && (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <iconData.Icon className="w-5 h-5 text-muted-foreground stroke-[1.5]" />
          </div>
        )}
        <FooterButton />
      </div>
    </motion.article>
  );
}
