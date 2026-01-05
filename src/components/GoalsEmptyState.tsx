import { motion } from 'framer-motion';
import { Target, ArrowRight } from 'lucide-react';

interface GoalsEmptyStateProps {
  onCreateGoal: () => void;
}

export function GoalsEmptyState({ onCreateGoal }: GoalsEmptyStateProps) {
  return (
    <div className="min-h-full flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-md text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-muted flex items-center justify-center"
        >
          <Target className="w-10 h-10 text-muted-foreground" />
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="font-display text-3xl text-foreground mb-4"
        >
          Goals give meaning to signals
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-muted-foreground text-lg leading-relaxed mb-10"
        >
          When you define what you're working toward, every insight becomes actionable. 
          Start with what matters most to your team right now.
        </motion.p>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          onClick={onCreateGoal}
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-medium text-lg hover:bg-primary/90 transition-all duration-300"
        >
          Create your first goal
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </motion.button>

        {/* Subtle helper */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 text-sm text-muted-foreground/70"
        >
          Takes about 2 minutes
        </motion.p>
      </motion.div>
    </div>
  );
}
