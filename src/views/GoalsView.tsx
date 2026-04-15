import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateGoalModal } from '@/components/CreateGoalModal';
import { useGoals, useCreateGoal, Goal } from '@/hooks/useSupabaseData';

export type GoalType = 'KPI' | 'OKR' | 'Success Metric' | 'Custom';

export function GoalsView() {
  const { data: goals = [], isLoading } = useGoals();
  const createGoalMutation = useCreateGoal();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateGoal = async (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    await createGoalMutation.mutateAsync(goalData);
    setIsModalOpen(false);
  };

  const typeColors: Record<GoalType, string> = {
    'KPI': 'bg-blue-100 text-blue-700',
    'OKR': 'bg-purple-100 text-purple-700',
    'Success Metric': 'bg-green-100 text-green-700',
    'Custom': 'bg-muted text-muted-foreground',
  };

  if (isLoading) {
    return (
      <div className="min-h-full px-6 py-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-full px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="font-display text-2xl text-foreground">Goals</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl"
          disabled={createGoalMutation.isPending}
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Add Goal
        </Button>
      </motion.div>

      {/* Content */}
      {goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Target className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No goals yet</h2>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            Create goals to track product outcomes over time
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl"
          >
            Add your first goal
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-card rounded-2xl p-5 shadow-card border border-border/50 hover:border-border transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${typeColors[goal.type]}`}>
                  {goal.type}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground leading-tight">
                {goal.title}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Goal Modal */}
      <CreateGoalModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreateGoal={handleCreateGoal}
      />
    </div>
  );
}
