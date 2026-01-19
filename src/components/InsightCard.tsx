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
      className="insight-card cursor-pointer group flex flex-col"
      onClick={handleClick}
    >
      {/* Header badges */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${typeBadgeClasses[insight.type]}`}>
            {typeLabels[insight.type]}
          </span>
          {insight.isNew && (
            <span className="w-2 h-2 rounded-full bg-foreground" />
          )}
        </div>
        <span className="px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground bg-muted/50">
          {insight.source.name}
        </span>
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-semibold mb-2.5 text-foreground leading-tight">
        {insight.title}
      </h3>
      
      {/* Description */}
      <p className="text-muted-foreground text-sm mb-6 flex-1 leading-relaxed">
        {insight.synthesis}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground font-medium mt-auto">
        <div className="flex items-center gap-4">
          <span>{formatDistanceToNow(insight.timestamp, { addSuffix: true })}</span>
          <span>{insight.evidenceCount} sources</span>
        </div>
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${
            insight.confidence >= 0.9 ? 'bg-[hsl(145,60%,45%)]' : 
            insight.confidence >= 0.8 ? 'bg-[hsl(145,60%,45%)]' : 
            'bg-[hsl(45,80%,50%)]'
          }`} />
          {Math.round(insight.confidence * 100)}% confidence
        </span>
      </div>
    </motion.article>
  );
}
