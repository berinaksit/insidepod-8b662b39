import { motion } from 'framer-motion';
import { Goal } from '@/types';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  index: number;
  onClick?: () => void;
}

const statusConfig = {
  'on-track': {
    icon: CheckCircle,
    label: 'On Track',
    className: 'text-foreground bg-muted',
  },
  'at-risk': {
    icon: AlertTriangle,
    label: 'At Risk',
    className: 'text-foreground bg-muted',
  },
  'off-track': {
    icon: AlertTriangle,
    label: 'Off Track',
    className: 'text-destructive bg-destructive/10',
  },
};

export function GoalCard({ goal, index, onClick }: GoalCardProps) {
  const status = statusConfig[goal.status];
  const StatusIcon = status.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onClick={onClick}
      className="insight-card cursor-pointer group flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.className}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </div>
        <span className="text-3xl font-semibold text-foreground tracking-tight">
          {goal.progress}%
        </span>
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-medium text-foreground mb-2 leading-snug">
        {goal.title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
        {goal.description}
      </p>
      
      {/* Progress bar - refined */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-auto">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${goal.progress}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="h-full bg-foreground rounded-full"
        />
      </div>
    </motion.article>
  );
}
