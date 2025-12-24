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
  signal: 'Signal',
};

const typeBadgeClasses: Record<string, string> = {
  pulse: 'badge-pulse',
  insight: 'badge-insight',
  signal: 'badge-signal',
};

export function InsightCard({ insight, index, onClick }: InsightCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="insight-card cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className={typeBadgeClasses[insight.type]}>
            {typeLabels[insight.type]}
          </span>
          {insight.isNew && (
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          )}
        </div>
        <span className="source-tag">{insight.source.name}</span>
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-3 group-hover:text-primary transition-colors duration-200">
        {insight.title}
      </h3>
      
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
        {insight.synthesis}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDistanceToNow(insight.timestamp, { addSuffix: true })}</span>
        <div className="flex items-center gap-4">
          <span>{insight.evidenceCount} sources</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            {Math.round(insight.confidence * 100)}% confidence
          </span>
        </div>
      </div>
    </motion.article>
  );
}
