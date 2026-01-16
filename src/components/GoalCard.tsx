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
    className: 'text-foreground/80 bg-muted',
  },
  'at-risk': {
    icon: AlertTriangle,
    label: 'At Risk',
    className: 'text-foreground/80 bg-muted',
  },
  'off-track': {
    icon: AlertTriangle,
    label: 'Off Track',
    className: 'text-foreground/80 bg-muted',
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
      className="insight-card cursor-pointer group flex flex-col"
    >
      {/* Header with status badge and percentage */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${status.className}`}>
          <StatusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          {status.label}
        </div>
        <span className="text-3xl font-semibold text-foreground">
          {goal.progress}%
        </span>
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight">
        {goal.title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
        {goal.description}
      </p>
      
      {/* Progress bar - thick dark style */}
      <div className="h-2.5 bg-muted rounded-full overflow-hidden mt-auto">
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
