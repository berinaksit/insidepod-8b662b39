import { motion } from 'framer-motion';
import { Target, Sparkles, TrendingUp, Zap } from 'lucide-react';

export function GoalsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[70vh] flex flex-col items-center justify-center px-8 py-16"
    >
      {/* Main Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative mb-10"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-muted to-accent flex items-center justify-center">
          <Target className="w-12 h-12 text-foreground/60" />
        </div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
        >
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </motion.div>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="font-display text-3xl text-foreground text-center mb-4"
      >
        Goals give meaning to signals
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-muted-foreground text-center max-w-md mb-10 leading-relaxed"
      >
        When you define what matters, your data starts telling a story. 
        Insights become actionable, and every metric points toward progress.
      </motion.p>

      {/* Feature hints */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Track progress</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Get insights</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
          <Sparkles className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Take action</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
