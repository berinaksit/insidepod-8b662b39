import { motion } from 'framer-motion';
import { Insight } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface InsightCardProps {
  insight: Insight;
  index: number;
  onClick?: () => void;
}

const typeLabels: Record<string, string> = {
  pulse: 'Pulse',
  insight: 'Insight',
  signal: 'Signal'
};

export function InsightCard({
  insight,
  index,
  onClick
}: InsightCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="insight-card cursor-pointer group flex flex-col"
      onClick={onClick}
    >
      {/* Header - minimal badges */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground">
            {typeLabels[insight.type]}
          </span>
          {insight.isNew && (
            <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {insight.source.name}
        </span>
      </div>
      
      {/* Title - strong hierarchy */}
      <h3 className="text-lg font-medium mb-3 text-foreground leading-snug">
        {insight.title}
      </h3>
      
      {/* Description - generous line-height */}
      <p className="text-muted-foreground text-sm mb-6 flex-1 leading-relaxed">
        {insight.synthesis}
      </p>
      
      {/* Footer - subtle meta */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50">
        <div className="flex items-center gap-4">
          <span>{formatDistanceToNow(insight.timestamp, { addSuffix: true })}</span>
          <span>{insight.evidenceCount} sources</span>
        </div>
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${
            insight.confidence >= 0.8 ? 'bg-foreground' : 'bg-muted-foreground'
          }`} />
          {Math.round(insight.confidence * 100)}%
        </span>
      </div>
    </motion.article>
  );
}
