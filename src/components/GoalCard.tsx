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
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${status.className}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {goal.progress}%
        </span>
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
        {goal.title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4">
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
