import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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

const typeBadgeClasses: Record<string, string> = {
  pulse: 'bg-muted text-foreground',
  insight: 'bg-muted text-foreground',
  signal: 'bg-[hsl(210,70%,94%)] text-[hsl(210,70%,40%)]'
};

export function InsightCard({
  insight,
  index,
  onClick
}: InsightCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    navigate(`/insight/${insight.id}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="insight-card cursor-pointer group flex flex-col p-6"
      onClick={handleClick}
    >
      {/* Header badges */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase ${typeBadgeClasses[insight.type]}`}>
            {typeLabels[insight.type]}
          </span>
          {insight.isNew && (
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        <span className="px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground/80 bg-muted/40">
          {insight.source.name}
        </span>
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-semibold mb-3 text-foreground leading-snug tracking-tight group-hover:text-primary transition-colors">
        {insight.title}
      </h3>
      
      {/* Description */}
      <p className="text-muted-foreground text-sm mb-8 flex-1 leading-relaxed line-clamp-3">
        {insight.synthesis}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground/70 font-medium mt-auto pt-4 border-t border-border/50">
        <div className="flex items-center gap-4">
          <span>{formatDistanceToNow(insight.timestamp, { addSuffix: true })}</span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            {insight.evidenceCount} sources
          </span>
        </div>
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            insight.confidence >= 0.9 ? 'bg-[hsl(145,60%,45%)]' : 
            insight.confidence >= 0.8 ? 'bg-[hsl(145,60%,45%)]' : 
            'bg-[hsl(45,80%,50%)]'
          }`} />
          <span className="font-semibold text-foreground/80">{Math.round(insight.confidence * 100)}%</span>
        </span>
      </div>
    </motion.article>
  );
}
