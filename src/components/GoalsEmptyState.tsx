import { motion } from 'framer-motion';
import { Target, ArrowRight } from 'lucide-react';

interface GoalsEmptyStateProps {
  onCreateGoal: () => void;
}

export function GoalsEmptyState({ onCreateGoal }: GoalsEmptyStateProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-md text-center"
      >
        {/* Calm icon treatment */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-8"
        >
          <Target className="w-10 h-10 text-muted-foreground" />
        </motion.div>

        {/* Editorial headline */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="font-display text-3xl text-foreground mb-4"
        >
          Goals give meaning to signals
        </motion.h2>

        {/* Supportive copy */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-muted-foreground text-lg leading-relaxed mb-10"
        >
          When you define what success looks like, Inside Pōd can surface insights 
          that actually matter—and filter out the noise.
        </motion.p>

        {/* Primary CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateGoal}
          className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-colors"
        >
          Create your first goal
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        {/* Subtle reassurance */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-sm text-muted-foreground mt-6"
        >
          Takes about a minute. You can always adjust later.
        </motion.p>
      </motion.div>
    </div>
  );
}
