import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

interface GoalsEmptyStateProps {
  onCreateGoal: () => void;
}

export function GoalsEmptyState({ onCreateGoal }: GoalsEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center"
    >
      {/* Calm illustration area */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative mb-8"
      >
        {/* Soft gradient backdrop */}
        <div className="absolute inset-0 -m-8 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-full blur-2xl" />
        
        {/* Icon container */}
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <Target className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
          
          {/* Subtle decorative rings */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute inset-0 -m-3 border border-border rounded-[2rem]"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute inset-0 -m-6 border border-border rounded-[2.5rem]"
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-md"
      >
        <h2 className="font-display text-2xl text-foreground mb-3">
          Goals give meaning to signals
        </h2>
        
        <p className="text-muted-foreground leading-relaxed mb-8">
          When you define what success looks like, every insight becomes actionable. 
          Set a goal and watch your data tell a story.
        </p>
        
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateGoal}
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          Create your first goal
        </motion.button>
      </motion.div>

      {/* Subtle helper text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 text-sm text-muted-foreground/60"
      >
        Goals help prioritize what matters most
      </motion.p>
    </motion.div>
  );
}
