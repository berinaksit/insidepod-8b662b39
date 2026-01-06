import { motion } from 'framer-motion';
import { GoalCard } from '@/components/GoalCard';
import { EmptyState } from '@/components/EmptyState';
import { mockGoals } from '@/data/mockData';
import { Target, Plus } from 'lucide-react';

export function GoalsView() {
  if (mockGoals.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="No goals defined yet"
        description="Set up your product goals to track progress and receive AI-powered insights on how to achieve them."
        action={{
          label: 'Create your first goal',
          onClick: () => console.log('Create goal'),
        }}
      />
    );
  }

  return (
    <div className="min-h-full px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="font-display text-2xl text-foreground mb-1">Goals</h1>
          <p className="text-muted-foreground">
            Track progress toward your product objectives
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </motion.div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockGoals.map((goal, index) => (
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
