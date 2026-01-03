import { motion } from 'framer-motion';
import { Goal } from '@/types';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  index: number;
  onClick?: () => void;
}

const statusConfig = {
  'on-track': {
    icon: CheckCircle,
    label: 'On Track',
    className: 'text-primary bg-primary/10',
  },
  'at-risk': {
    icon: AlertTriangle,
    label: 'At Risk',
    className: 'text-secondary bg-secondary/10',
  },
  'off-track': {
    icon: TrendingUp,
    label: 'Off Track',
    className: 'text-destructive bg-destructive/10',
  },
};

export function GoalCard({ goal, index, onClick }: GoalCardProps) {
  const status = statusConfig[goal.status];
  const StatusIcon = status.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={onClick}
      className="insight-card cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
          <StatusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          {status.label}
        </div>
        <span className="text-sm text-muted-foreground font-semibold">
          {goal.progress}%
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
        {goal.title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-3">
        {goal.description}
      </p>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${goal.progress}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="h-full bg-primary rounded-full"
        />
      </div>
    </motion.article>
  );
}
