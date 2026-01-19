import { motion } from 'framer-motion';
import { GoalCard } from '@/components/GoalCard';
import { GoalsEmptyState } from '@/components/GoalsEmptyState';
import { useDocuments } from '@/contexts/DocumentsContext';

export function GoalsView() {
  const { goals } = useDocuments();

  if (goals.length === 0) {
    return <GoalsEmptyState />;
  }

  return (
    <div className="min-h-full px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-display text-2xl text-foreground mb-1">Goals</h1>
        <p className="text-muted-foreground">
          Track progress toward your product objectives
        </p>
      </motion.div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal, index) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
