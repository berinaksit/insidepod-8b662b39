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
  type LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

// Badge type mapping
type BadgeType = 'Signal' | 'Pulse' | 'Insight';

const getBadgeType = (type: string): BadgeType => {
  switch (type) {
    case 'signal':
      return 'Signal';
    case 'pulse':
      return 'Pulse';
    case 'insight':
      return 'Insight';
    default:
      return 'Insight';
  }
};

// Cards that can show badges and buttons (0-indexed positions in the grid)
// Middle card on first row (index 1), first card on second row (index 3), third card on second row (index 5)
const CARDS_WITH_BADGES = [1, 3, 5];

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

  // Determine if this is a dark card (index 0) or white card
  const isDarkCard = index === 0;
  
  // Only white cards at specific positions can show badges and buttons
  const canShowBadgeAndButton = !isDarkCard && CARDS_WITH_BADGES.includes(index);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    navigate(`/insight/${insight.id}`);
  };

  const badgeType = getBadgeType(insight.type);

  // Featured card (first one) - dark themed, no badge/button
  if (isDarkCard) {
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
            <span>{insight.source.name} · {insight.evidenceCount} sources</span>
          </div>
        </div>
      </motion.article>
    );
  }

  // White cards with optional badge and button
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
      {/* Badge - only for specific cards */}
      {canShowBadgeAndButton && (
        <div className="mb-4">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
            {badgeType}
          </span>
        </div>
      )}
      
      {/* Title - single clear takeaway */}
      <h3 className="text-lg font-semibold text-foreground leading-snug mb-auto">
        {insight.title}
      </h3>
      
      {/* Footer area */}
      <div className="mt-8">
        {/* Icon for cards without badge/button */}
        {!canShowBadgeAndButton && (
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <Icon className="w-5 h-5 text-muted-foreground stroke-[1.5]" />
          </div>
        )}
        
        {/* Button - only for specific cards */}
        {canShowBadgeAndButton ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full font-medium text-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {insight.source.name} · {insight.evidenceCount} sources
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground font-medium">
            {insight.source.name} · {insight.evidenceCount} sources
          </div>
        )}
      </div>
    </motion.article>
  );
}
