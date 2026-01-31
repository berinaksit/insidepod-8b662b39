import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-8 text-center"
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center mb-4 sm:mb-6">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" strokeWidth={3} />
      </div>
      
      <h3 className="text-lg sm:text-xl font-medium text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground max-w-sm mb-4 sm:mb-6 text-sm sm:text-base">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
