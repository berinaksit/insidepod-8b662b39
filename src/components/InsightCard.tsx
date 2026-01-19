import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Insight } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InsightCardProps {
  insight: Insight;
  index: number;
  onClick?: () => void;
}

const badgeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, label: string }> = {
  pulse: { icon: TrendingUp, label: 'Pulse' },
  signal: { icon: AlertTriangle, label: 'Signal' },
  insight: { icon: Lightbulb, label: 'Insight' }
};

export function InsightCard({
  insight,
  index,
  onClick
}: InsightCardProps) {
  const navigate = useNavigate();
  const { icon: BadgeIcon, label: badgeLabel } = badgeConfig[insight.type] || badgeConfig.insight;

  // Create varied layouts based on index
  const layoutVariant = index % 4;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    navigate(`/insight/${insight.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClick();
  };

  const relativeTime = formatDistanceToNow(insight.timestamp, { addSuffix: true });

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
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-background/15 text-background/90">
            <BadgeIcon className="w-3.5 h-3.5 stroke-[1.5]" />
            {badgeLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-background leading-snug mb-3">
          {insight.title}
        </h3>
        
        {/* Summary */}
        <p className="text-sm text-background/70 leading-relaxed mb-auto line-clamp-2">
          {insight.synthesis}
        </p>
        
        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-background/15 hover:bg-background/25 text-background text-xs font-medium"
            onClick={handleButtonClick}
          >
            {insight.source.name} · {insight.evidenceCount} sources
          </Button>
          <span className="text-xs text-background/50">{relativeTime}</span>
        </div>
      </motion.article>
    );
  }

  // Quote-style card
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
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
            <BadgeIcon className="w-3.5 h-3.5 stroke-[1.5]" />
            {badgeLabel}
          </span>
          {insight.isNew && (
            <span className="w-2 h-2 rounded-full bg-foreground" />
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground leading-snug mb-3">
          {insight.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-auto line-clamp-2">
          {insight.synthesis}
        </p>
        
        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-medium"
            onClick={handleButtonClick}
          >
            {insight.source.name} · {insight.evidenceCount} sources
          </Button>
          <span className="text-xs text-muted-foreground">{relativeTime}</span>
        </div>
      </motion.article>
    );
  }

  // Icon-focused card
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
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
            <BadgeIcon className="w-3.5 h-3.5 stroke-[1.5]" />
            {badgeLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground leading-snug mb-3">
          {insight.title}
        </h3>
        
        {/* Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-auto line-clamp-2">
          {insight.synthesis}
        </p>
        
        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-medium"
            onClick={handleButtonClick}
          >
            {insight.source.name} · {insight.evidenceCount} sources
          </Button>
          <span className="text-xs text-muted-foreground">{relativeTime}</span>
        </div>
      </motion.article>
    );
  }

  // Minimal card
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
      {/* Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
          <BadgeIcon className="w-3.5 h-3.5 stroke-[1.5]" />
          {badgeLabel}
        </span>
        {insight.isNew && (
          <span className="w-2 h-2 rounded-full bg-foreground" />
        )}
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground leading-snug mb-3">
        {insight.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-auto line-clamp-2">
        {insight.synthesis}
      </p>
      
      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs font-medium"
          onClick={handleButtonClick}
        >
          {insight.source.name} · {insight.evidenceCount} sources
        </Button>
        <span className="text-xs text-muted-foreground">{relativeTime}</span>
      </div>
    </motion.article>
  );
}
